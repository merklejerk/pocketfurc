var _ = require( "underscore" );
var Constants = require( "./Constants" );
var Eventful = require( "./Eventful" );
var ListenerHost = require( "./ListenerHost" );
var Util = require( "./Util" );
var Connection = require( "./Connection" );
var LoginService = require( "./LoginService" );
var GameService = require( "./GameService" );

module.exports = function( )
{
	var STATE_CONNECTED = 0x1;
	var STATE_LOGIN_READY = 0x3;
	var STATE_LOGGED_IN = 0x5;

	var _this = this;
	var _events = new Eventful( this );
	var _chatListeners = new ListenerHost( );
	var _connection;
	var _service;
	var _states = 0x0;
	var _loginInfo = null;
	var _rawLog = false;
	var _wasKicked = false;

	this.destroy = function( )
	{
		if (_service)
			_service.destroy( );
		_connection.close( );
	}

	this.addChatListener = function( listener )
	{
		_chatListeners.add( listener );
	}

	this.removeChatListener = function( listener )
	{
		_chatListeners.remove( listener );
	}

	this.wasKicked = function( )
	{
		return _wasKicked;
	}

	this.isRawLogOn = function( )
	{
		return _rawLog;
	}

	this.toggleRawLog = function( toggle )
	{
		_rawLog = toggle;
		if (_connection)
			_connection.logging( _rawLog );
		_info( "Raw logging " + (_rawLog ? "enabled" : "disabled") + "." );
	}

	this.connect = function( )
	{
		_info( "Connecting..." );
		_connection = new Connection( Constants.ServerAddress, Constants.ServerPort );
		_connection.on( "connect-fail", _onConnectFail );
		_connection.on( "connected", _onConnected );
		_connection.on( "disconnected", _onDisconnected );
		_connection.logging( _rawLog );
		_connection.connect( );
	}

	this.isConnected = function( )
	{
		return (_states & STATE_CONNECTED) == STATE_CONNECTED;
	}

	this.isReadyToLogin = function( )
	{
		return (_states & STATE_LOGIN_READY) == STATE_LOGIN_READY;
	}

	this.isLoggedIn = function( )
	{
		return (_states & STATE_LOGGED_IN) == STATE_LOGGED_IN;
	}

	this.login = function( email, password, name, description )
	{
		if (_states & STATE_LOGIN_READY)
		{
			_loginInfo = {
				"email": email,
				"password": password,
				"name": name,
				"description": description || "",
			};
			_login( );
		}
	}

	var _login = function( )
	{
		_info( "Logging in..." );
		_service.login( _loginInfo.email, _loginInfo.password, _loginInfo.name );
	}

	this.speak = function( msg )
	{
		if (_this.isLoggedIn( ))
			_service.speak( msg );
	}

	this.emote = function( msg )
	{
		if (_this.isLoggedIn( ))
			_service.emote( msg );
	}

	this.whisper = function( player, msg )
	{
		if (_this.isLoggedIn( ))
			_service.whisper( player, msg );
	}

	this.lookAtPlayer = function( player)
	{
		if (_this.isLoggedIn( ))
			_service.lookAtPlayer( player );
	}

	this.summon = function( player )
	{
		if (_this.isLoggedIn( ))
			_service.summon( player );
	}

	this.join = function( player )
	{
		if (_this.isLoggedIn( ))
			_service.join( player );
	}

	this.sendRawLine = function( msg )
	{
		if (_service)
			_service.raw( msg );
	}

	this.quit = function( forceDisconnect )
	{
		if ((_states & STATE_LOGGED_IN) == STATE_LOGGED_IN)
		{
			_service.quit( );
			if (forceDisconnect)
				_connection.disconnect( );
		}
		else
			_connection.disconnect( );
	}

	this.getPlayer = function( )
	{
		return _loginInfo.name;
	}

	this.getMapPlayers = function( )
	{
		if (_this.isLoggedIn( ))
			return _service.getMapPlayers( );
		return [];
	}

	this.getMapPlayerByName = function( name )
	{
		if (_this.isLoggedIn( ))
			return _service.getMapPlayerByName( name );
		return null;
	}

	this.getCameraPosition = function( )
	{
		if (_this.isLoggedIn( ))
			return _service.getCameraPosition( );
		return null;
	}

	this.getMapPlayerByUID = function( uid )
	{
		if (_this.isLoggedIn( ))
			return _service.getMapPlayerByUID( uid );
		return null;
	}

	this.addMapListener = function( listener )
	{
		if (_this.isLoggedIn( ))
			_service.addMapListener( listener );
	}

	this.removeMapListener = function( listener )
	{
		if (_this.isLoggedIn( ))
			_service.removeMapListener( listener );
	}

	var _onConnectFail = function( err )
	{
		_error( "Connection error: " + err );
		_events.raise( "disconnected" );
	}

	var _onConnected = function( )
	{
		_states = STATE_CONNECTED;
		_info( "Connected to server." );
		_service = new LoginService( _connection );
		_service.on( "login-ready", _onLoginReady );
		_service.on( "logged-in", _onLoggedIn );
		_service.on( "login-fail", _onLoginFail );
		_events.raise( "connected" );
	}

	var _onDisconnected = function( err )
	{
		_states = 0x0;
		if (_service)
			_service.destroy( );
		_service = null;
		if (err)
			_warning( "Disconnected (" + err + ")" );
		else
			_info( "Disconnected" );
		_events.raise( "disconnected", err );
	}

	var _onLoginReady = function( )
	{
		_states = STATE_LOGIN_READY;
		_info( "Ready to log in." );
		_events.raise( "login-ready" );
	}

	var _onLoggedIn = function( )
	{
		_states = STATE_LOGGED_IN;
		_info( "Logged in." );
		_service.destroy( );
		_initGameService( );
		_service.initCostume( );
		_service.setPlayerDescription( _loginInfo.description );
		_events.raise( "logged-in" );
	}

	var _onLoginFail = function( msg )
	{
		_error( "Login failed: " + msg );
		_events.raise( "login-fail", msg );
	}

	var _initGameService = function( )
	{
		_service = new GameService( _connection );
		_service.on( "chat", _.partial( _chatListeners.raise, "onChat" ) );
		_service.on( "chat-speech", _.partial( _chatListeners.raise, "onSpeech" ) );
		_service.on( "chat-whisper", _.partial( _chatListeners.raise, "onWhisper" ) );
		_service.on( "chat-speech-echo", _.partial( _chatListeners.raise, "onSpeechEcho", _loginInfo.name ) );
		_service.on( "chat-whisper-echo", _.partial( _chatListeners.raise, "onWhisperEcho" ) );
		_service.on( "chat-emote", _onChatEmote );
		_service.on( "load-map", _onLoadMap );
		_service.on( "enter-map", _onEnterMap );
		_service.on( "kicked", _onKicked );
	}

	var _onLoadMap = function( mapName )
	{
		_service.mapReady( );
	}

	var _onEnterMap = function( mapName )
	{
		_info( "Entered map." );
		_events.raise( "enter-map", mapName );
	}

	var _onKicked = function( )
	{
		_wasKicked = true;
	}

	var _onChatEmote = function( player, msg )
	{
		// Need to do additional work to find out if an emote is an echo.
		if (player == _loginInfo.name)
			_chatListeners.raise( "onEmoteEcho", _loginInfo.name, msg );
		else
			_chatListeners.raise( "onEmote", player, msg );
	}

	this.checkOnline = function( name, callback )
	{
		if (_this.isLoggedIn( ))
			_service.checkOnline( name, callback );
		else
			callback( name, false );
	}

	var _error = function( msg )
	{
		_events.raise( "log", msg, Constants.LOG_LEVEL_ERROR );
	}

	var _warning = function( msg )
	{
		_events.raise( "log", msg, Constants.LOG_LEVEL_WARNING );
	}

	var _info = function( msg )
	{
		_events.raise( "log", msg, Constants.LOG_LEVEL_INFO );
	}
};
