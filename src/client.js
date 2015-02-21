var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var jsfurcClient = require( "./jsfurc/Client" );
var jsfurcConstants = require( "./jsfurc/Constants" );
var Eventful = require( "./jsfurc/Eventful" );
var Header = require( "./Header" );
var ChatArea = require( "./ChatArea" );
var LoginPrompt = require( "./LoginPrompt" );

var _client = null;
var _lastStatusMessageTime = 0;
var _chatArea;
var _loginInfo;
var _loginPrompt = new LoginPrompt( );
var _header;

var _init = function( )
{
   _initWindow( );
   _initHeader( );
   _initChatArea( );
   _createClient( );
   _loginPrompt.on( "log", _displayStatus );
   setInterval( _onHeartbeat, 500 );
}

var _initWindow = function( )
{
   // Don't rely on this ever getting fired.
   chrome.app.window.current( ).onClosed.addListener( function( ) {
         // Attempt graceful shutdown. happening
         if (_client)
            _client.quit( true );
      } );
   // Chromes apps don't always respect vh vw changes.
   $(window).on( "resize", function( ) {
         $("body").css( {
            "width": $(window).width( ),
            "height": $(window).height( ) } );
      } );
}

var _initHeader = function( )
{
   _header = new Header( new HeaderApp( ) );
}

var _initChatArea = function( )
{
   _chatArea = new ChatArea( $("#content"), new ChatAreaApp( ) );
}

var _createClient = function( )
{
   _client = new jsfurcClient( );
   _client.on( "log", _displayStatus );
   _client.on( "disconnected", _onDisconnected );
   _client.on( "connected", _onConnected );
   _client.on( "login-ready", _onLoginReady );
   _client.on( "logged-in", _onLoggedIn );
   _client.on( "chat", _onChat );
   _client.on( "chat-speech", _onChatSpeech );
   _client.on( "chat-whisper", _onChatWhisper );
   _client.on( "chat-emote", _onChatEmote );
   _client.on( "chat-speech-echo", _onChatSpeechEcho );
   _client.on( "chat-whisper-echo", _onChatWhisperEcho );
   _client.on( "chat-emote-echo", _onChatEmoteEcho );
   _client.connect( );
}

var _promptForLogin = function( )
{
   _loginPrompt.show( $("#content"), function( loginInfo ) {
      _loginInfo = _.extend( {}, loginInfo );
      if (_client.isReadyToLogin( ))
         _login( );
   } );
}

var _login = function( )
{
   _client.login( _loginInfo.name, _loginInfo.password,
      _loginInfo.description, _loginInfo.colors );
}

var _onDisconnected = function( err )
{
   if (_loginPrompt.isOpen( ))
      _loginPrompt.close( );
   _header.getApp( ).events.raise( "disconnect" );
}

var _onConnected = function( err )
{
   _header.getApp( ).events.raise( "connect" );
}

var _reconnect = function( )
{
   _client.destroy( );
   _createClient( );
}

var _onLoginReady = function( )
{
   if (!_loginInfo)
      _promptForLogin( );
   else
      _login( );
}

var _displayStatus = function( msg, level )
{
   $("#content > .status")
      .stop( )
      .text( msg )
      .css( "color", level >= jsfurcConstants.LOG_LEVEL_WARNING ? "red" : "white" )
      .show( );
   _lastStatusMessageTime = util.time( );
}

var _onLoggedIn = function( )
{
   _header.getApp( ).events.raise( "login" );
   _chatArea.focusInput( );
}

var _onHeartbeat = function( )
{
   _updateStatus( );
}

var _onChat = function( msg )
{
   _chatArea.appendChat( msg );
}

var _onChatSpeech = function( player, msg )
{
   _chatArea.appendSpeech( player, msg );
}

var _onChatWhisper = function( player, msg )
{
   _chatArea.appendWhisper( player, msg );
}

var _onChatEmote = function( player, msg )
{
   _chatArea.appendEmote( player, msg );
}

var _onChatSpeechEcho = function( player, msg )
{
   _chatArea.appendSpeechEcho( player, msg );
}

var _onChatWhisperEcho = function( player, msg )
{
   _chatArea.appendWhisperEcho( player, msg );
}

var _onChatEmoteEcho = function( player, msg )
{
   _chatArea.appendEmoteEcho( player, msg );
}

var _updateStatus = function( )
{
   if (util.time( ) - _lastStatusMessageTime > 10.0)
   {
      var status = $("#content > .status");
      if (status.is( ":visible" ))
         status.fadeOut( 2000 );
   }
}

var ChatAreaApp = function( )
{
   var _this = this;

   this.isFriend = function( username )
   {
      console.log( "TODO" );
      return false;
   }

   this.isIgnored = function( username )
   {
      console.log( "TODO" );
      return false;
   }

   this.lookAt = function( username )
   {
      _client.lookAtPlayer( username );
   }

   this.ignore = function( username, toggle )
   {
      console.log( "TODO" );
   }

   this.friend = function( username, toggle )
   {
      console.log( "TODO" );
   }

   this.sendWhisper = function( player, msg )
   {
      _client.whisper( player, msg );
   }

   this.sendSpeech = function( msg )
   {
      _client.speak( msg );
   }

   this.sendEmote = function( msg )
   {
      _client.emote( msg );
   }

   this.sendRaw = function( msg )
   {
      if (msg == "rawlog")
         _client.toggleRawLog( !_client.isRawLogOn( ) );
      else
         _client.sendRawLine( msg );
   }
}

var HeaderApp = function( )
{
   var _this = this;

   this.events = new Eventful( this );

   this.isConnected = function( )
   {
      if (_client)
         return _client.isConnected( );
   }

   this.isLoggedIn = function( )
   {
      if (_client)
         return _client.isLoggedIn( );
   }

   this.areIgnoresEnabled = function( )
   {
      console.log( "TODO" );
      return false;
   }

   this.toggleIgnores = function( toggle )
   {
      console.log( "TODO" );
   }

   this.logOut = function( )
   {
      _loginInfo = null;
      _loginPrompt.clear( );
      if (_client)
         _client.quit( true );
   }

   this.close = function( )
   {
      if (_client)
         _client.quit( true );
      chrome.app.window.current( ).close( ).close( );
   }

   this.about = function( )
   {
      console.log( "TODO" );
   }

   this.reconnect = function( )
   {
      _reconnect( );
   }
}

$("body").ready( _init );
