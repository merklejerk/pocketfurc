require( ["config.js"], function( ) {
	require( [
		"jquery.all",
		"underscore",
		"util",
		"jsfurc/jsfurc",
		"Header",
		"ChatArea",
		"LoginPrompt",
		"templates.compiled"
		],
		function( $, _, util, jsfurc, Header, ChatArea, LoginPrompt, templates ) {

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
}

var _initHeader = function( )
{
	_header = new Header( );
	_header.on( "reconnect", function( ) {
		_header.toggleReconnect( false );
		_reconnect( );
	} );
	_header.on( "log-out", function( ) {
		_loginInfo = null;
		_loginPrompt.clear( );
		if (_client)
			_client.quit( true );
	} );
	_header.on( "close", function( ) {
		if (_client)
			_client.quit( true );
		chrome.app.window.current( ).close( ).close( );
	} );
}

var _initChatArea = function( )
{
	_chatArea = new ChatArea( $("#content") );
	_chatArea.on( "submit", _onSubmitChat );
}

var _createClient = function( )
{
	_client = new jsfurc.Client( );
	_client.on( "log", _displayStatus );
	_client.on( "disconnected", _onDisconnected );
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

var _onSubmitChat = function( msg )
{
	var initial = msg.charAt( 0 );
	if (initial == "`")
		_client.sendRawLine( msg.substr( 1 ) );
	else if (initial == ":")
		_client.emote( msg.substr( 1 ) );
	else if (initial == "/")
		_handleWhisperCommand( msg );
	else
		_client.speak( msg );
}

var _handleWhisperCommand = function( comm )
{
	var m = /^\/(.+) +(.+)$/.exec( comm );
	if (m)
		_client.whisper( m[1], m[2] );
}

var _onDisconnected = function( err )
{
	if (_loginPrompt.isOpen( ))
		_loginPrompt.close( );
	_header.setLoggedIn( false );
	_header.toggleReconnect( true );
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

var _displayStatus = function( level, msg )
{
	$("#status > .content")
		.stop( )
		.text( msg )
		.css( "color", level >= jsfurc.LOG_LEVEL_WARNING ? "red" : "white" )
		.show( );
	_lastStatusMessageTime = util.time( );
}

var _onLoggedIn = function( )
{
	_header.setLoggedIn( true );
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
	if (util.time( ) - _lastStatusMessageTime > 180.0)
	{
		var content = $("#status > .content");
		if (content.is( ":visible" ))
			content.fadeOut( 2000 );
	}
}

$("body").ready( _init );

} ) } );
