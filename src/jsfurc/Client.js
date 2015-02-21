var _ = require( "underscore" );
var Constants = require( "./Constants" );
var Eventful = require( "./Eventful" );
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
   var _connection;
   var _service;
   var _states = 0x0;
   var _loginInfo = null;

   this.destroy = function( )
   {
      _service.destroy( );
      _connection.close( );
   }

   this.connect = function( )
   {
      _info( "Connecting..." );
      _connection = new Connection( Constants.ServerAddress, Constants.ServerPort );
      _connection.on( "connect-fail", _onConnectFail );
      _connection.on( "connected", _onConnected );
      _connection.on( "disconnected", _onDisconnected );
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

   this.login = function( name, password, description, colors )
   {
      _loginInfo = {
         "name": name,
         "password": password,
         "description": description || "",
         "colors": colors || "t$$$$$$$$$$$$#"
      };
      if (_states & STATE_LOGIN_READY)
         _login( );
   }

   var _login = function( )
   {
      _info( "Logging in..." );
      _service.login( _loginInfo.name, _loginInfo.password );
   }

   this.speak = function( msg )
   {
      _service.speak( msg );
   }

   this.emote = function( msg )
   {
      _service.emote( msg );
   }

   this.whisper = function( player, msg )
   {
      _service.whisper( player, msg );
   }

   this.lookAtPlayer = function( player)
   {
      _service.lookAtPlayer( player );
   }

   this.sendRawLine = function( msg )
   {
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

   var _onConnectFail = function( err )
   {
      _error( "Connection error: " + err );
      _events.raise( "disconnected", err );
   }

   var _onConnected = function( )
   {
      _states = STATE_CONNECTED;
      _info( "Connected to server." );
      _service = new LoginService( _connection );
      _service.on( "login-ready", _onLoginReady );
      _service.on( "logged-in", _onLoggedIn );
      _events.raise( "connected" );
   }

   var _onDisconnected = function( err )
   {
      _states = 0x0;
      _info( "Disconnected: " + err );
      _events.raise( "disconnected", err );
   }

   var _onLoginReady = function( )
   {
      _states = STATE_LOGIN_READY;
      _info( "Ready to log in." );
      _events.raise( "login-ready" );
      if (_loginInfo)
         _login( );
   }

   var _onLoggedIn = function( )
   {
      _states = STATE_LOGGED_IN;
      _info( "Logged in." );
      _service.destroy( );
      _initGameService( );
      _service.initPlayer( _loginInfo.colors, _loginInfo.description );
      //_service.mapReady( );
      _events.raise( "logged-in" );
   }

   var _initGameService = function( )
   {
      _service = new GameService( _connection );
      _service.on( "chat", _.partial( _events.raise, "chat" ) );
      _service.on( "chat-speech", _.partial( _events.raise, "chat-speech" ) );
      _service.on( "chat-whisper", _.partial( _events.raise, "chat-whisper" ) );
      _service.on( "chat-speech-echo", _.partial( _events.raise, "chat-speech-echo", _loginInfo.name ) );
      _service.on( "chat-whisper-echo", _.partial( _events.raise, "chat-whisper-echo" ) );
      _service.on( "chat-emote", _onChatEmote );
      _service.on( "load-map", _onLoadMap );
      _service.on( "load-dream", _onLoadDream );
   }

   var _onLoadMap = function( mapName )
   {
      _service.mapReady( );
      _info( "Entered map." );
   }

   var _onLoadDream = function( dreamID1, dreamID2 )
   {
      _service.mapReady( );
      _info( "Entered map." );
   }

   var _onChatEmote = function( player, msg )
   {
      // Need to do additional work to find out if an emote is an echo.
      if (player == _loginInfo.name)
         _events.raise( "chat-emote-echo", _loginInfo.name, msg );
      else
         _events.raise( "chat-emote", player, msg );
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
