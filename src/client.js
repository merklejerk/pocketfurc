var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var jsfurcClient = require( "./jsfurc/Client" );
var Eventful = require( "./jsfurc/Eventful" );
var Header = require( "./Header" );
var ChatArea = require( "./ChatArea" );
var LoginPrompt = require( "./LoginPrompt" );
var FriendsList = require( "./FriendsList" );
var templates = require( "./templates" );
var Device = require( "./Device" );
var Ignores = require( "./Ignores" );

var _client = null;
var _chatArea;
var _loginInfo;
var _loginPrompt = new LoginPrompt( );
var _rawLog = false;
var _autoReconnect = true;
var _header;
var _friends;
var _ignores;
var _device;
var _missedWhispers = [];

var _init = function( )
{
	_device = new Device( _onDeviceReady );
	_device.on( "foreground", _onForeground );
}

var _onDeviceReady = function( )
{
	_initWindow( );
	_initHeader( );
	_initChatArea( );
	_createClient( );
	_initFriendsList( );
	_initIgnores( );
	_loginPrompt.on( "log", _displayStatus );
}

var _initWindow = function( )
{
	// Don't rely on this ever getting fired.
	chrome.app.window.current( ).onClosed.addListener( function( ) {
			// Attempt graceful shutdown.
			if (_client)
				_client.quit( true );
		} );
	$(window).on( "resize", _.debounce( _onResize, 100 ) );
	_.defer( _onResize );
}

var _initHeader = function( )
{
	_header = new Header( new _HeaderApp( ), $("#header") );
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

var _initIgnores = function( )
{
	_ignores = new Ignores( );
}

var _displayStatus = function( msg, lvl )
{
	_header.pushStatus( msg, lvl );
}

var _createClient = function( )
{
	_autoReconnect = true;
	_header.getApp( ).events.raise( "connect" );

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
		_amendLoginInfo( );
		if (_client.isReadyToLogin( ))
			_login( );
	} );
}

var _onResize = function( )
{
	_header.fit( );
	_chatArea.fit( );
	_loginPrompt.fit( );

}

var _amendLoginInfo = function( )
{
	if (_loginInfo)
	{
		var stamp = "[<a href=\"https://github.com/cluracan/pocketfurc\">pocketfurc</a>]";
		if (_loginInfo.description.indexOf( stamp ) == -1)
			_loginInfo.description += " " + stamp;
	}
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
	_chatArea.appendChat( "Disconnected." );
	var willAutoReconnect = _autoReconnect && !_client.wasKicked( );
	if (!willAutoReconnect)
		_device.allowBackgroundMode( false );
	else
		_reconnect( );
	_updateBackgroundNotification( );
}

var _onConnected = function( err )
{
	_updateBackgroundNotification( );
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

var _onLoggedIn = function( )
{
	_header.getApp( ).events.raise( "login" );
	_chatArea.focusInput( );
	_device.allowBackgroundMode( true );
	_updateBackgroundNotification( );
}

var _onEnterMap = function( mapName )
{
	_client.addMapListener( new _MapListener( ) );
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

var _onForeground = function( )
{
	if (_missedWhispers.length)
	{
		_chatArea.appendChat( _createMissedWhispersMessage( ) );
		_missedWhispers = [];
	}
	_updateBackgroundNotification( );
}

var _createMissedWhispersMessage = function( )
{
	var players = _.keys( _.groupBy( _missedWhispers, "player" ) );
	var chatMsg = "You receieved " + _missedWhispers.length +
		" whisper" + (_missedWhispers.length > 1 ? "s": "") +
		" from ";
	_.each( players,
		function( name, index, list ) {
			chatMsg += "<name>" + name + "</name>";
			chatMsg += (index+1 < list.length ? ", " : "");
		} );
	chatMsg += " while you were away.";
	return chatMsg;
}

var _updateBackgroundNotification = function( )
{
	var msg;
	if (!_client || !_client.isConnected( ))
		msg = "Disconnected";
	else if (!_client.isLoggedIn( ))
		msg = "Connected"
	else // Logged in.
	{
		msg = "Logged in";
		var numFriendsOnline = _getFriendsOnline( ).length;
		var numPlayersNearby = _getVisiblePlayers( ).length;
		if (_missedWhispers.length)
			msg = _missedWhispers.length + " whisper" + (_missedWhispers.length > 1 ? "s" : "") + " received";
		else if (numFriendsOnline)
			msg = numFriendsOnline + " friend" + (numFriendsOnline > 1 ? "s" : "") + " online";
		else if (numPlayersNearby)
			msg = numPlayersNearby + " player" + (numPlayersNearby > 1 ? "s" : "") + " nearby";
	}
	_device.setBackgroundText( msg );
}

var _ChatListener = function( )
{
	this.onChat = function( msg )
	{
		var player;
		if (player = _parsePlayerSystemMessage( msg ))
		{
			if (_ignores.isIgnored( player ))
				return;
		}
		_chatArea.appendChat( msg );
	}

	var _parsePlayerSystemMessage = function( msg )
	{
		var re = /^<font color='[^']+'><name shortname='[^']+'>([^<]+)<\/name>/;
		var m = msg.match( re );
		if (!m)
			return false;
		return m[1];
	}

	this.onSpeech = function( player, msg )
	{
		_friends.setStatus( player, true );
		if (!_ignores.isIgnored( player ))
			_chatArea.appendSpeech( player, msg );
	}

	this.onWhisper = function( player, msg )
	{
		_friends.setStatus( player, true );
		if (!_ignores.isIgnored( player ))
		{
			_chatArea.appendWhisper( player, msg );
			if (_device.isBackground( ))
			{
				_missedWhispers.push( {"player": player, "msg": msg } );
				_updateBackgroundNotification( );
			}
		}
	}

	this.onEmote = function( player, msg )
	{
		_friends.setStatus( player, true );
		if (!_ignores.isIgnored( player ))
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
		return _ignores.isIgnored( username );
	}

	this.lookAt = function( username )
	{
		_client.lookAtPlayer( username );
	}

	this.ignore = function( username, toggle )
	{
		_ignores.toggleIgnore( username, toggle );
		if (toggle)
			_displayStatus( username + " ignored." );
		else
			_displayStatus( username + " no longer ignored." );
	}

	this.friend = function( username, toggle )
	{
		if (toggle)
		{
			_friends.addFriend( username );
			_displayStatus( username + " added to friends." );
		}
		else
		{
			_friends.removeFriend( username );
			_displayStatus( username + " removed from friends." );
		}
		_updateHeaderCounts( );
		_updateBackgroundNotification( );
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
		var m = msg.match( /^\S+/ );
		if (m)
		{
			var firstWord = m[0];
			switch (firstWord)
			{
			case "rawlog":
				_client.toggleRawLog( !_client.isRawLogOn( ) );
				_rawLog = _client.isRawLogOn( );
				break;
			case "purge":
				chrome.storage.sync.clear( );
				break;
			case "reload":
				_friends.reload( );
				_ignores.reload( );
				break;
			case "pos":
				var m = msg.match( /^pos\s+(\S+)/ );
				if (!m)
					_printCameraPosition( );
				else
					_printPlayerPosition( m[1] );
				break;
			default:
				_client.sendRawLine( msg );
			}
		}
	}

	this.summon = function( player )
	{
		_client.summon( player );
	}

	this.join = function( player )
	{
		_client.join( player );
	}

	var _printCameraPosition = function( )
	{
		var pos = _client.getCameraPosition( );
		_chatArea.appendChat( "(" + pos.x + "," + pos.y + ")" );
	}

	var _printPlayerPosition = function( player )
	{
		var player = _client.getMapPlayerByName( player );
		if (player)
			_chatArea.appendChat( "(" + player.x + "," + player.y + ")" );
		else
			_chatArea.appendChat( "No player by that name." );
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

	this.listIgnores = function( )
	{
		var template = templates["chat-message-list-ignores"];
		_chatArea.appendChat( template( { "players": _ignores.getList( ) } ) );
	}

	this.logOut = function( )
	{
		_loginInfo = null;
		_loginPrompt.clear( );
		_autoReconnect = false;
		if (_client)
			_client.quit( true );
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
		_updateBackgroundNotification( );
	}

	this.onPlayerNotVisible = function( )
	{
		_updateHeaderCounts( );
		_updateBackgroundNotification( );
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
		if (_client && _client.isLoggedIn( ))
		{
			_displayStatus( name + " is " + (online ? "online." : "offline.") );
			//_notifyFriendOnline( name );
			_updateBackgroundNotification( );
		}
		_updateHeaderCounts( );
	}
}

$("body").ready( _init );
