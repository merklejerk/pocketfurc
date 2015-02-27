var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var jsfurcClient = require( "./jsfurc/Client" );
var jsfurcConstants = require( "./jsfurc/Constants" );
var Eventful = require( "./jsfurc/Eventful" );
var Header = require( "./Header" );
var ChatArea = require( "./ChatArea" );
var LoginPrompt = require( "./LoginPrompt" );
var FriendsList = require( "./FriendsList" );
var templates = require( "./templates" );

var _client = null;
var _lastStatusMessageTime = 0;
var _chatArea;
var _loginInfo;
var _loginPrompt = new LoginPrompt( );
var _rawLog = false;
var _header;
var _friends;

var _init = function( )
{
   _initWindow( );
   _initHeader( );
   _initChatArea( );
   _createClient( );
   _initFriendsList( );
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
   // Chrome apps don't always respect vh vw changes.
   $(window).on( "resize", function( ) {
         $("body").css( {
            "width": $(window).width( ),
            "height": $(window).height( ) } );
      } );
}

var _initHeader = function( )
{
   _header = new Header( new _HeaderApp( ) );
}

var _initChatArea = function( )
{
   _chatArea = new ChatArea( $("#content"), new _ChatAreaApp( ) );
}

var _initFriendsList = function( )
{
   _friends = new FriendsList( new _FriendsListClient( ) );
   _friends.addListener( new _FriendsListListener( ) );
}

var _createClient = function( )
{
   _client = new jsfurcClient( );
   _client.on( "log", _displayStatus );
   _client.on( "disconnected", _onDisconnected );
   _client.on( "connected", _onConnected );
   _client.on( "login-ready", _onLoginReady );
   _client.on( "logged-in", _onLoggedIn );
   _client.addChatListener( new _ChatListener( ) );
   _client.on( "enter-map", _onEnterMap );
   _client.toggleRawLog( _rawLog );
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
   _friends.reset( );
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

var _onEnterMap = function( mapName )
{
   _client.addMapListener( new _MapListener( ) );
}

var _onHeartbeat = function( )
{
   _updateStatus( );
}

var _updateStatus = function( )
{
   if (util.time( ) - _lastStatusMessageTime > 10.0)
   {
      var status = $("#content > .status");
      if (status.css( "display" ) != "none")
         status.fadeOut( 2000 );
   }
}

var _updateHeaderCounts = function( )
{
   _header.setPlayersVisible( _getVisiblePlayers( ).length );
   _header.setFriendsOnline( _getFriendsOnline( ).length );
}

var _getVisiblePlayers = function( )
{
   return _.filter( _client.getMapPlayers( ),
      function( player ) {
         return player.visible;
   } );
}

var _getFriendsOnline = function( )
{
   return _.filter( _.values( _friends.getFriends( ) ),
         function( friend ) {
            return friend.online;
   } );
}

var _ChatListener = function( )
{
   this.onChat = function( msg )
   {
      _chatArea.appendChat( msg );
   }

   this.onSpeech = function( player, msg )
   {
      _friends.setStatus( player, true );
      _chatArea.appendSpeech( player, msg );
   }

   this.onWhisper = function( player, msg )
   {
      _friends.setStatus( player, true );
      _chatArea.appendWhisper( player, msg );
   }

   this.onEmote = function( player, msg )
   {
      _friends.setStatus( player, true );
      _chatArea.appendEmote( player, msg );
   }

   this.onSpeechEcho = function( player, msg )
   {
      _chatArea.appendSpeechEcho( player, msg );
   }

   this.onWhisperEcho = function( player, msg )
   {
      _chatArea.appendWhisperEcho( player, msg );
   }

   this.onEmoteEcho = function( player, msg )
   {
      _chatArea.appendEmoteEcho( player, msg );
   }
}

var _ChatAreaApp = function( )
{
   var _this = this;

   this.isFriend = function( username )
   {
      return _friends.isFriend( username );
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
      if (toggle)
      {
         _friends.addFriend( username );
         _displayStatus( username.replace( /\|/g, " " ) + " added to friends." );
      }
      else
      {
         _friends.removeFriend( username );
         _displayStatus( username.replace( /\|/g, " " ) + " removed from friends." );
      }
      _updateHeaderCounts( );
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
      {
         _client.toggleRawLog( !_client.isRawLogOn( ) );
         _rawLog = _client.isRawLogOn( );
      }
      else if (msg == "purge")
      {
         chrome.storage.sync.clear( );
      }
      else if (msg == "reload")
      {
         _friends.reload( );
      }
      else
         _client.sendRawLine( msg );
   }
}

var _HeaderApp = function( )
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
      window.open( "https://github.com/cluracan/pocketfurc" );
   }

   this.reconnect = function( )
   {
      _reconnect( );
   }

   this.showPlayersVisible = function( )
   {
      if (_client)
      {
         var players = _getVisiblePlayers( );
         players.sort( function( a, b ) { return a.name.localeCompare( b.name ); } );
         var msg = templates["chat-message-nearby-players"]( { "players": players } );
         _chatArea.appendChat( msg );
      }
   }

   this.showFriendsOnline = function( )
   {
      var friends = _.filter( _friends.getFriends( ),
         function( friend ) {
            return friend.online;
         } )
         .sort( function( a, b ) {
            return a.name.localeCompare( b.name );
         } );
      var msg = templates["chat-message-friends-online"]( { "players": friends } );
      _chatArea.appendChat( msg );
   }
}

var _MapListener = function( )
{
   var _this = this;

   this.onPlayerCreated = function( uid )
   {
      var player = _client.getMapPlayerByUID( uid );
      _friends.setStatus( player.name, true );
      _updateHeaderCounts( );
   }

   this.onPlayerVisible = function( )
   {
      _updateHeaderCounts( );
   }

   this.onPlayerNotVisible = function( )
   {
      _updateHeaderCounts( );
   }

   this.onPlayerRemoved = function( )
   {
      _updateHeaderCounts( );
   }
}

var _FriendsListClient = function( )
{
   this.addChatListener = function( listener )
   {
      if (_client)
         _client.addChatListener( listener );
   }

   this.checkOnline = function( name, callback )
   {
      if (_client)
         _client.checkOnline( name, callback );
      else
         callback( name, false );
   }
}

var _FriendsListListener = function( )
{
   var _this = this;

   this.onFriendStatus = function( name, online )
   {
      name = name.replace( /\|/g, " " );
      _displayStatus( name + " is " + (online ? "online." : "offline.") );
      _updateHeaderCounts( );
   }
}

$("body").ready( _init );
