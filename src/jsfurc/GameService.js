var _ = require( "underscore" );
var Constants = require( "./Constants" );
var Util = require( "./Util" );
var GameServiceEncoder = require( "./GameServiceEncoder" );
var GameServiceDecoder = require( "./GameServiceDecoder" );
var Eventful = require( "./Eventful" );
var GameMap = require( "./GameMap" );

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
   var _map;
   var _outstandingOnlineChecks = {};

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
      if (_map)
         _map.destroy( );
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

   this.summon = function( player )
   {
      connection.sendLine( _encoder.summon(
         { "player": player } ) );
   }

   this.join = function( player )
   {
      connection.sendLine( _encoder.join(
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

   var _resetMap = function( )
   {
      if (_map)
         _map.destroy( );
      _map = new GameMap( _decoder );
   }

   this.getMapPlayers = function( )
   {
      if (_map)
         return _map.getAllPlayerInfos( );
      return [];
   }

   this.getMapPlayerByUID = function( uid )
   {
      if (_map)
         return _map.getPlayerInfoByUID( uid );
      return null;
   }

	this.getMapPlayerByName = function( name )
   {
      if (_map)
         return _map.getPlayerInfoByName( name );
      return null;
   }

	this.getCameraPosition = function( )
	{
		if (_map)
			return _map.getCameraPosition( );
		return { "x": 0, "y": 0 };
	}

   this.addMapListener = function( listener )
   {
      if (_map)
         _map.addListener( listener );
   }

   this.removeMapListener = function( listener )
   {
      if (_map)
         _map.removeListener( listener );
   }

   this.checkOnline = function( name, callback )
   {
      var key = Util.createCanonicalPlayerName( name );
      if (!(key in _outstandingOnlineChecks))
         _outstandingOnlineChecks[key] = [];
      _outstandingOnlineChecks[key].push( callback );
      connection.sendLine( _encoder.checkOnline( { "player": name } ) );
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

      this.onLoadMap = function( mapName )
      {
         _events.raise( "load-map", mapName );
      }

      this.onUsePatch  = function( patchID, patchNum )
      {
         _events.raise( "use-patch", patchID, patchNum );
      }

      this.onEnterMap = function( mapName )
      {
         _resetMap( );
         _events.raise( "enter-map", mapName );
      }

      this.onOnlineCheckResult = function( player, online )
      {
         var key = Util.createCanonicalPlayerName( player );
         if (key in _outstandingOnlineChecks)
         {
            var callbacks = _outstandingOnlineChecks[key];
            delete _outstandingOnlineChecks[key];
            _.each( callbacks,
                  function( callback ) {
               callback( player, online );
            } );
         }
      }

		this.onKicked = function( )
		{
			_events.raise( "kicked" );
		}
   }

   _init( );
}
