var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var FancyChatBuffer = require( "./FancyChatBuffer" );
var ChatInput = require( "./ChatInput" );
var jsfurcUtil = require( "./jsfurc/Util" );

module.exports = function( container, app )
{
   var _this = this;
   var _elem = $("<div class='chat-area' />");
   var _chatBuffer;
   var _chatInput;

   this.getApp = function( )
   {
      return app;
   }

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

   var _fit = function( )
   {
      var containerHeight = _elem.height( );
      var bufferHeight = Math.max( 0, containerHeight - _chatInput.getHeight( ) );
      _chatBuffer.resize( bufferHeight );
   }

   var ChatBufferApp = function( )
   {
      _.extend( this, app );

      this.initiateWhisper = function( player )
      {
         var canonicalName = jsfurcUtil.createCanonicalPlayerName( player );
         _chatInput.set( "/%" + canonicalName + " \xA0" );
         _chatInput.focus( );
      }
   }

   container.append( _elem );
   _chatBuffer = new FancyChatBuffer( _elem, new ChatBufferApp( ) );
   _chatInput = new ChatInput( _elem, app );
   _chatInput.on( "grow shrink", _fit );
   $(window).on( "resize", _fit );
   _.defer( _fit );
}
