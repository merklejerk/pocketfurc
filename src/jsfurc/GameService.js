var _ = require( "underscore" );
var Constants = require( "./Constants" );
var Util = require( "./Util" );
var GameServiceEncoder = require( "./GameServiceEncoder" );
var GameServiceDecoder = require( "./GameServiceDecoder" );
var Eventful = require( "./Eventful" );

module.exports = function( connection )
{
   var STATE_MAP_LOADED = 0x1;

   var _this = this;
   var _state = 0x0;
   var _destroyed = false;
   var _encoder = new GameServiceEncoder( );
   var _decoder = new GameServiceDecoder( );
   var _events = new Eventful( this );
   var _keepAliveTimer;

   var _init = function( )
   {
      _decoder.addListener( new _DecoderListener( ) );
      _keepAliveTimer = setInterval( _onKeepAliveTimer, 60000 );
      connection.on( "received", _onReceived );
      _onReceived( );
   }

   this.destroy = function( )
   {
      clearInterval( _keepAliveTimer );
      connection.unsubscribe( "received", _onReceived );
      _destroyed = true;
   }

   var _onReceived = function( line )
   {
      while (!_destroyed)
      {
         var line = connection.readLine( );
         if (line)
             _decoder.decode( line );
         else
            break;
      }
   }

   var _onKeepAliveTimer = function( )
   {
      connection.sendLine( _encoder.keepAlive( ) );
      connection.sendLine( _encoder.lookAtPosition( { "x": 0, "y": 0 } ) );
   }

   this.initPlayer = function( colorCode, description )
   {
      connection.sendLines(
         [
            _encoder.setPlayerDescription(
               { "description": description } ),
            _encoder.setPlayerColorsSpeciesRaw(
               { "colorCode": colorCode } )
         ] );
   }

   this.mapReady = function( )
   {
      connection.sendLine( _encoder.mapReady( ) );
   }

   this.speak = function( msg )
   {
      connection.sendLine( _encoder.speak(
         { "msg": msg } ) );
   }

   this.emote = function( msg )
   {
      connection.sendLine( _encoder.emote(
         { "msg": msg } ) );
   }

   this.whisper = function( player, msg )
   {
      connection.sendLine( _encoder.whisper(
         { "player": player, "msg": msg } ) );
   }

   this.lookAtPlayer = function( player )
   {
      connection.sendLine( _encoder.lookAtPlayer(
         { "player": player } ) );
   }

   this.raw = function( msg )
   {
      connection.sendLine( msg );
   }

   this.quit = function( )
   {
      connection.sendLine( _encoder.quit( ) );
   }

   var _DecoderListener = function( )
   {
      var _service = _this;
      var _this = this;

      this.onChat = function( msg )
      {
         _events.raise( "chat", msg );
      }

      this.onChatSpeech = function( player, msg )
      {
         _events.raise( "chat-speech", player, msg );
      }

      this.onChatEmote = function( player, msg )
      {
         _events.raise( "chat-emote", player, msg );
      }

      this.onChatWhisper = function( player, msg )
      {
         _events.raise( "chat-whisper", player, msg );
      }

      this.onChatSpeechEcho = function( msg )
      {
         _events.raise( "chat-speech-echo", msg );
      }

      this.onChatWhisperEcho = function( player, msg )
      {
         _events.raise( "chat-whisper-echo", player, msg );
      }
   }

   _init( );
}
