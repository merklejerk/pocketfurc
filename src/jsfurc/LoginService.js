var _ = require( "underscore" );
var Constants = require( "./Constants" );
var Util = require( "./Util" );
var LoginServiceEncoder = require( "./LoginServiceEncoder" );
var LoginServiceDecoder = require( "./LoginServiceDecoder" );
var Eventful = require( "./Eventful" );

module.exports = function( connection )
{
	var PENDING_LOGIN = 0x1;
	var PENDING_REGISTER = 0x2;

	var _this = this;
	var _destroyed = false;
	var _pending = 0x0;
	var _encoder = new LoginServiceEncoder( );
	var _decoder = new LoginServiceDecoder( );
	var _events = new Eventful( this );

	var _init = function( )
	{
		_decoder.addListener( new _DecoderListener( ) );
		connection.on( "received", _onReceived );
		_onReceived( );
	}

	this.destroy = function( )
	{
		connection.unsubscribe( "received", _onReceived );
		_destroyed = true;
	}

	var _onReceived = function( line )
	{
		while (!_destroyed)
		{
			var line = connection.readLine( );
			if (line)
				_decoder.decode( line );
			else
				break;
		}
	}

	this.login = function( email, password, name )
	{
		_pending |= PENDING_LOGIN;
		connection.sendLine( _encoder.login(
			{ "email": email, "password": password, "name": name } ) );
	}

	this.register = function( name, password, email )
	{
		_pending |= PENDING_REGISTER;
		connection.sendLine( _encoder.register(
			{ "name": name, "password": password, "email": email } ) );
	}

	var _onLoggedIn = function( )
	{
		_pending &= ~PENDING_LOGIN;
		_events.raise( "logged-in" );
	}

	var _DecoderListener = function( )
	{
		var _service = _this;
		var _this = this;

		this.onLoginFail = function( msg )
		{
			_pending &= ~PENDING_LOGIN;
			_events.raise( "login-fail", msg );
		}

		this.onRegisterPlayerFail = function( msg )
		{
			_pending &= ~PENDING_REGISTER;
			_events.raise( "register-player-fail", msg )
		}

		this.onSuccess = function( )
		{
			if (_pending & PENDING_LOGIN)
				_onLoggedIn( );
			else if (_pending & PENDING_REGISTER)
			{
				_pending &= ~PENDING_REGISTER;
				_events.raise( "registered" );
			}
		}

		this.onLoginReady = function( )
		{
			_events.raise( "login-ready" );
		}
	}

	_init( );
}
