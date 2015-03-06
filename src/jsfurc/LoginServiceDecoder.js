var _ = require( "underscore" );
var ListenerHost = require( "./ListenerHost" );
var TrafficFormatter = require( "./TrafficFormatter" );

module.exports = function( )
{
	var _this = this;
	var _clearToSend = false;
	var _listeners = new ListenerHost( this );
	var _fmt = new TrafficFormatter( );

	this.decode = function( line )
	{
		if (!_clearToSend)
		{
			if (_fmt.parse( "Dragonroar", line ))
			{
				_clearToSend = true;
				_listeners.raise( "onLoginReady" );
			}
		}
		else
		{
			var m;
			if (m = /^]#xxxx \d+ (.*)/.exec( line ))
				_listeners.raise( "onLoginFail", m[1] );
			else if (m = /^N\{\w+\}(.*)/.exec( line ))
				_listeners.raise( "onRegisterPlayerFail", m[1] );
			else if (m = /^&&+/.exec( line ))
				_listeners.raise( "onSuccess" );
		}
	}
};
