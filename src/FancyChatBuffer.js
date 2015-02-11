var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var ChatBuffer = require( "./ChatBuffer" );
var ContentEncoder = require( "./FancyChatBufferContentEncoder" );

module.exports = function( container ) {
	var _this = this;
	var _pinned = true;
	var _buffer = new ChatBuffer( container );
	var _lastLine;
	var _updateTimer;
	var _lastBlock;
	var _contentEncoder = new ContentEncoder( );

	this.resize = function( height )
	{
		_buffer.resize( height );
	}

	this.appendSystemMessage = function( msg )
	{
		var params = {"message": _encodeContent( msg ) };
		if (params.message.length)
		{
			var block = $(templates["fancy-chat-buffer-block-system"]( params ));
			var content = $(templates["fancy-chat-buffer-content-system"]( params ));
			_appendLine( block, content, "system:" + name );
		}
	}

	this.appendSpeech = function( name, msg )
	{
		var params = {"name": _encodeName( name ), "message": _encodeContent( msg ) };
		if (params.message.length)
		{
			var block = $(templates["fancy-chat-buffer-block-speech"]( params ));
			var content = $(templates["fancy-chat-buffer-content-speech"]( params ));
			_appendLine( block, content, "speech:" + name );
		}
	}

	this.appendWhisper = function( name, msg )
	{
		var params = {"name": _encodeName( name ), "message": _encodeContent( msg ) };
		if (params.message.length)
		{
			var block = $(templates["fancy-chat-buffer-block-whisper"]( params ));
			var content = $(templates["fancy-chat-buffer-content-whisper"]( params ));
			_appendLine( block, content, "whisper:" + name );
		}
	}

	this.appendEmote = function( name, msg )
	{
		var params = {"name": _encodeName( name ), "message": _encodeContent( msg ) };
		if (params.message.length)
		{
			params.message = params.message.charAt(0) == "'" ? params.message : " " + params.message;
			var block = $(templates["fancy-chat-buffer-block-emote"]( params ));
			var content = $(templates["fancy-chat-buffer-content-emote"]( params ));
			_appendLine( block, content, "emote" ); // Emotes all go together
		}
	}

	this.appendSpeechEcho = function( name, msg )
	{
		var params = {"name": _encodeName( name ), "message": _encodeContent( msg ) };
		if (params.message.length)
		{
			var block = $(templates["fancy-chat-buffer-block-speech-echo"]( params ));
			var content = $(templates["fancy-chat-buffer-content-speech-echo"]( params ));
			_appendLine( block, content, "speech-echo:" + name );
		}
	}

	this.appendEmoteEcho = function( name, msg )
	{
		var params = {"name": _encodeName( name ), "message": _encodeContent( msg ) };
		if (params.message.length)
		{
			params.message = params.message.charAt(0) == "'" ? params.message : " " + params.message;
			var block = $(templates["fancy-chat-buffer-block-emote-echo"]( params ));
			var content = $(templates["fancy-chat-buffer-content-emote-echo"]( params ));
			_appendLine( block, content, "emote" ); // Emotes all go together
		}
	}

	this.appendWhisperEcho = function( name, msg )
	{
		var params = {"name": _encodeName( name ), "message": _encodeContent( msg ) };
		if (params.message.length)
		{
			var block = $(templates["fancy-chat-buffer-block-whisper-echo"]( params ));
			var content = $(templates["fancy-chat-buffer-content-whisper-echo"]( params ));
			_appendLine( block, content, "whisper-echo:" + name );
		}
	}

	var _appendLine = function( block, content, blockType )
	{
		var lastBlockType = _lastBlock ? _lastBlock.data( "block-type" ) : null;
		var lastBlockTimestamp = _lastBlock ? _lastBlock.data( "block-timestamp" ) : null;
		var now = util.time( );
		if (lastBlockType == blockType && now - lastBlockTimestamp < 60)
			// Merge with last block.
			block.remove( );
		else
		{
			block.data( "block-type", blockType );
			block.data( "block-timestamp", now );
			_wire( block );
			_updateBlock( block );
			_lastBlock = block;
			_buffer.appendLine( _lastBlock );
		}
		_wire( content );
		_lastBlock.find( ".content" ).append( content );
		_buffer.contentsChanged( );
	}

	var _wire = function( elem )
	{
		elem.find( ".username" )
			.on( "click", function( e ) {
					e.preventDefault( );
					_showPlayerMenu( $(this).attr( "data-username" ) );
				} );
	}

	var _fixContentLinks = function( contentElem )
	{
		contentElem.find( "a[href]" ).each(
			function( ) {
				var a = $(this);
				var href = a.attr( "href" );
				if (href.indexOf( "http://" ) != 0 &&
					href.indexOf( "https://" ) != 0 &&
					href.indexOf( "ftp://" ) != 0)
					a.attr( "href", "http://" + href );
			} );
	}

	var _encodeContent = function( rawContentString )
	{
		return _contentEncoder.encode( rawContentString );
	}

	var _encodeName = function( rawName )
	{
		return rawName.replace( /\|/g, " " );
	}

	var _updateBlocks = function( )
	{
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
		block.find( ".age" ).each(
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

	var _showPlayerMenu = function( username )
	{
		console.log( "TODO " + username );
	}

	_updateTimer = setInterval( _updateBlocks, 15000 );
	_buffer.on( "line-culled", _onLineCulled );
};
