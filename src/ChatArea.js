define( ["jquery.all","underscore","util","FancyChatBuffer",
	"ChatBuffer","ChatInput","jsfurc/Eventful"],
	function( $, _, util, FancyChatBuffer, ChatBuffer, ChatInput, Eventful ) {

return function( container )
{
	var _this = this;
	var _elem = $("<div class='chat-area' />");
	var _chatBuffer;
	var _chatInput;
	var _events = new Eventful( this );

	this.appendChat = function( msg )
	{
		return _chatBuffer.appendSystemMessage( msg );
	}

	this.appendSpeech = function( player, msg )
	{
		return _chatBuffer.appendSpeech( player, msg );
	}

	this.appendWhisper = function( player, msg )
	{
		return _chatBuffer.appendWhisper( player, msg );
	}

	this.appendEmote = function( player, msg )
	{
		return _chatBuffer.appendEmote( player, msg );
	}

	this.appendSpeechEcho = function( player, msg )
	{
		return _chatBuffer.appendSpeechEcho( player, msg );
	}

	this.appendEmoteEcho = function( player, msg )
	{
		return _chatBuffer.appendEmoteEcho( player, msg );
	}

	this.appendWhisperEcho = function( player, msg )
	{
		return _chatBuffer.appendWhisperEcho( player, msg );
	}

	this.resized = function( )
	{
		_chatBuffer.resized( );
	}

	_chatBuffer = new FancyChatBuffer( _elem );
	_chatInput = new ChatInput( _elem );
	_chatInput.on( "submit", _.partial( _events.raise, "submit" ) );
	container.append( _elem );
}

} );
