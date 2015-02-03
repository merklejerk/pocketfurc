define( ["jquery.all","underscore","util","templates.compiled.js"],
	function( $, _, util, templates ) {

return function( container ) {

	var _this = this;
	var _pinned = true;
	var _elem = $("<div class='chat-buffer' />");

	var _onScroll = function( e )
	{
		var h = _elem.get(0).scrollHeight;
		_pinned = _elem.height( ) + _elem.scrollTop( ) >= h;
	}

	this.resized = function( )
	{
		_this.contentsChanged( );
	}

	this.contentsChanged = function( )
	{
		if (_pinned)
			_elem.scrollTop( _elem.get(0).scrollHeight );
	}

	this.isPinned = function( )
	{
		return _pinned;
	}

	this.appendChat = function( msg )
	{
		var body = templates["chat-buffer-line-body-chat"](
			{
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendSpeech = function( name, msg )
	{
		var body = templates["chat-buffer-line-body-speech"](
			{
				"name": name,
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendWhisper = function( name, msg )
	{
		var body = templates["chat-buffer-line-body-whisper"](
			{
				"name": name,
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendEmote = function( name, msg )
	{
		var body = templates["chat-buffer-line-body-emote"](
			{
				"name": name,
				"message": msg.charAt( 0 ) == '\'' ? msg : " " + msg
			} );
		_appendLine( body );
	}

	this.appendSpeechEcho = function( name, msg )
	{
		var body = templates["chat-buffer-line-body-speech-echo"](
			{
				"name": name,
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendEmoteEcho = function( name, msg )
	{
		var body = templates["chat-buffer-line-body-emote-echo"](
			{
				"name": name,
				"message": msg.charAt( 0 ) == '\'' ? msg : " " + msg
			} );
		_appendLine( body );
	}

	this.appendWhisperEcho = function( name, msg )
	{
		var body = templates["chat-buffer-line-body-whisper-echo"](
			{
				"name": name,
				"message": msg
			} );
		_appendLine( body );
	}

	var _appendLine = function( body )
	{
		var line = templates["chat-buffer-line"](
			{
				"timestamp": util.createTimestamp( ),
				"body": body
			} );
		_elem.append( line );
		_this.contentsChanged( );
	}

	container.append( _elem );
	_elem.on( "scroll", _onScroll );
};

} );
