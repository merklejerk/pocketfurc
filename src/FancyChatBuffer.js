define( ["jquery.all","underscore","util","templates.compiled",
	"ChatBuffer"],
	function( $, _, util, templates, ChatBuffer ) {

return function( container ) {


	var _this = this;
	var _pinned = true;
	var _buffer = new ChatBuffer( container );
	var _lastLine;
	var _updateTimer;
	var _lastBlock;

	this.resized = function( )
	{
		_buffer.resized( );
	}

	this.appendSystemMessage = function( msg )
	{
		var body = templates["fancy-chat-buffer-line-system"](
			{
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendSpeech = function( name, msg )
	{
		var body = templates["fancy-buffer-line-speech"](
			{
				"name": name,
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendWhisper = function( name, msg )
	{
		var body = templates["fancy-chat-buffer-line-whisper"](
			{
				"name": name,
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendEmote = function( name, msg )
	{
		var body = templates["fancy-chat-buffer-line-emote"](
			{
				"name": name,
				"message": msg.charAt( 0 ) == '\'' ? msg : " " + msg
			} );
		_appendLine( body );
	}

	this.appendSpeechEcho = function( name, msg )
	{
		var body = templates["fancy-chat-buffer-line-speech-echo"](
			{
				"name": name,
				"message": msg
			} );
		_appendLine( body );
	}

	this.appendEmoteEcho = function( name, msg )
	{
		var body = templates["fancy-chat-buffer-line-emote-echo"](
			{
				"name": name,
				"message": msg.charAt( 0 ) == '\'' ? msg : " " + msg
			} );
		_appendLine( body );
	}

	this.appendWhisperEcho = function( name, msg )
	{
		var block = templates["fancy-chat-buffer-block-whisper-echo"(
			{
				"name": name
			} );
		var content = templates["fancy-chat-buffer-content-whisper-echo"](
			{
				"message": msg
			} );
		_appendLine( block, body, "whisper-echo:" + name );
	}

	var _appendLine = function( block, content, blockType )
	{
		var lastBlockType = _lastBlock ? null : _lastBlock.data( "block-type" );
		var lastBlockTimestamp = _lastBlock ? null : _lastBlock.data( "block-timestamp" );
		var now = util.time( );
		if (_lastBlockType == blockType && now - lastBlockTimestamp < 60)
			// Merge with last block.
			block.remove( );
		else
		{
			block.data( "block-type", blockType );
			block.data( "block-timestamp", now );
			_wire( block, block );
			_updateBlock( block );
			_lastBlock = block;
			_buffer.appendLine( _lastBlock );
		}
		_wire( block, content );
		_lastBlock.find( ".content" ).append( content );
		_buffer.contentChanged( );
	}

	var _wire = function( elem )
	{
		elem.find( ".username" )
			.on( "click", function( ) {
					_showPlayerMenu( $(this), $(this).attr( "data-username" ) );
				} );
	}

	var _updateBlocks = function( )
	{
		var now = util.time( );
		var blocks = _buffer.getLines( );
		_.each( blocks,
			function( block ) {
				_updateBlock( $(block) );
			} );
	}

	var _updateBlock = function( block )
	{
		var timestamp = block.data( "block-timestamp" );
		var age = util.time( ) - timestamp;
		var ageStr = util.createAgeString( age );
		block.find( ".block-age" ).each(
			function( ) {
				var elem = $(this);
				elem.text( ageStr );
			} );
	}

	var _onLineCulled = function( block )
	{
		block = $(block);
		if (block.get(0) == _lastBlock.get(0))
			_lastBlock = null;
		block.remove( );
	}

	_updateTimer = setInterval( _updateBlocks, 30000 );
	_buffer.on( "line-culled", _onLineCulled );
};

} );
