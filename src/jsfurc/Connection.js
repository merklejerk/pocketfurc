var _ = require( "underscore" );
var Eventful = require( "./Eventful" );
var Util = require( "./Util" );
var SerialLineBuffer = require( "./SerialLineBuffer" );

module.exports = function( address, port )
{
	var _this = this;
	var _socket;
	var _sendBuffer = [];
	var _recvBuffer = new SerialLineBuffer( );
	var _linesReceived = [];
	var _events = new Eventful( this );
	var _connected = false;
	var _logging = false;

	this.close = function( )
	{
		_closeSocket( );
	}

	this.logging = function( toggle )
	{
		_logging = toggle;
	}

	this.isConnected = function( )
	{
		return _connected;
	}

	this.connect = function( )
	{
		chrome.sockets.tcp.create(
			{
				"bufferSize": 8192
			},
			function( createInfo ) {
				_socket = createInfo.socketId;
				chrome.sockets.tcp.onReceive.addListener( _onReceive );
				chrome.sockets.tcp.onReceiveError.addListener( _onReceiveError );
				chrome.sockets.tcp.connect( _socket,
					address, port, _onConnected );
				setTimeout( _onConnectTimeout, 30 * 1000 );
				} );
	}

	this.readLine = function( )
	{
		var line = _this.peekLine( );
		if (line)
			_linesReceived = _.rest( _linesReceived, 1 );
		return line;
	}

	this.peekLine = function( )
	{
		if (_linesReceived.length > 0)
			return _linesReceived[0];
	}

	this.disconnect = function( )
	{
		if (_socket && _connected)
			chrome.sockets.tcp.disconnect( _socket, _onDisconnected );
		else
			_onDisconnected( );
	}

	var _onConnectTimeout = function( )
	{
		if (_socket && !_connected)
		{
			_closeSocket( );
			_events.raise( "connect-fail", "Timed out" );
		}
	}

	var _onConnected = function( resultCode )
	{
		if (resultCode < 0)
		{
			_closeSocket( );
			_events.raise( "connect-fail", resultCode );
		}
		else
		{
			_connected = true;
			chrome.sockets.tcp.setKeepAlive( _socket, true, 10, _.noop );
			_netPump( );
			_events.raise( "connected" );
		}
	}

	var _closeSocket = function( )
	{
		if (_socket)
			chrome.sockets.tcp.close( _socket );
		_socket = null;
		_connected = false;
		chrome.sockets.tcp.onReceive.removeListener( _onReceive );
		chrome.sockets.tcp.onReceiveError.removeListener( _onReceiveError );
	}

	this.sendLine = function( line )
	{
		if( _connected)
		{
			_sendBuffer.push( line );
			_send( );
		}
	}

	this.sendLines = function( lines )
	{
		_.each( lines, function( line ) {
			_this.sendLine( line );
		} );
	}

	var _send = function( )
	{
		if (_socket && _connected)
		{
			_.each( _sendBuffer,
				function( line ) {
					if (_logging)
						console.log( ">>> " + line );
					var data = Util.stringToBuffer( line + "\n" );
					chrome.sockets.tcp.send( _socket, data.buffer,
						 function( resultCode ) {
							if (resultCode < 0)
								_onDisconnected( )
						} );
					_events.on( "sent", line );
				} );
			_sendBuffer = [];
		}
	}

	var _onDisconnected = function( )
	{
		_connected = false;
		// Let netpump deliver this event.
	}

	var _onReceive = function( info )
	{
		if (info.socketId == _socket)
		{
			var data = new Uint8Array( info.data );
			for (var i = 0; i < data.length; ++i)
			{
				var line = _recvBuffer.put( data[i] );
				if (line)
				{
					if (_logging)
						console.log( "<<< " + line );
					_linesReceived.push( line );
				}
			}
		}
	}

	var _onReceiveError = function( info )
	{
		if (info.socketId == _socket)
		{
			_onDisconnected( info.resultCode );
		}
	}

	var _netPump = function( )
	{
		if (_socket)
		{
			if (_linesReceived.length)
				_events.raise( "received" );
			if (_connected)
				setTimeout( arguments.callee, 333 );
			else if (!_linesReceived.length)
			{
				// Don't raise a disconnect until all lines have been read.
				_closeSocket( );
				_events.raise( "disconnected" );
			}
		}
	}
};
