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

   this.close = function( )
   {
      _closeSocket( );
      chrome.sockets.tcp.onReceive.removeListener( _onReceive );
      chrome.sockets.tcp.onReceiveError.removeListener( _onReceiveError );
   }

   this.isConnected = function( )
   {
      return _connected;
   }

   this.connect = function( )
   {
      chrome.sockets.tcp.create( null,
         function( createInfo ) {
            _socket = createInfo.socketId;
            chrome.sockets.tcp.onReceive.addListener( _onReceive );
            chrome.sockets.tcp.onReceiveError.addListener( _onReceiveError );
            chrome.sockets.tcp.connect( _socket,
               address, port, _onConnected );
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
      chrome.sockets.tcp.disconnect( _socket, _onDisconnected );
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
         _events.raise( "connected" );
      }
   }

   var _closeSocket = function( )
   {
      if (_socket)
         chrome.sockets.tcp.close( _socket );
      _socket = null;
      _connected = false;
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
      _.each( _sendBuffer,
         function( line ) {
            var data = Util.stringToBuffer( line + "\n" );
            chrome.sockets.tcp.send( _socket, data.buffer,
                function( resultCode ) {
                  if (resultCode < 0)
                     _onDisconnected( resultCode )
               } );
            _events.on( "sent", line );
         } );
      _sendBuffer = [];
   }

   var _onDisconnected = function( resultCode )
   {
      _closeSocket( );
      _events.raise( "disconnected", resultCode );
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
               _linesReceived.push( line );
               _events.raise( "received", line );
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
};
