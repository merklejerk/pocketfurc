var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var FancyChatBuffer = require( "./FancyChatBuffer" );
var ChatInput = require( "./ChatInput" );
var Eventful = require( "./jsfurc/Eventful" );

module.exports = function( container )
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

	this.focusInput = function( )
	{
		_chatInput.focus( );
	}

	var _onInputWhisper = function( player, msg )
	{
		_events.raise( "whisper", player, msg );
	}

	var _onInputEmote = function( msg )
	{
		_events.raise( "emote", msg );
	}

	var _onInputSpeech = function( msg )
	{
		_events.raise( "speech", msg );
	}

	var _onInputRaw = function( msg )
	{
		_events.raise( "raw", msg );
	}

	var _fit = function( )
	{
		var containerHeight = _elem.height( );
		var bufferHeight = Math.max( 0, containerHeight - _chatInput.getHeight( ) );
		_chatBuffer.resize( bufferHeight );
	}

	container.append( _elem );
	_chatBuffer = new FancyChatBuffer( _elem );
	_chatInput = new ChatInput( _elem );
	_chatInput.on( "whisper", _onInputWhisper );
	_chatInput.on( "emote", _onInputEmote );
	_chatInput.on( "speech", _onInputSpeech );
	_chatInput.on( "raw", _onInputRaw );
	_chatInput.on( "grow shrink", _fit );
	$(window).on( "resize", _fit );
	_.defer( _fit );
}
