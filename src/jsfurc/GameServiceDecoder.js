var $ = require( "jquery" );
var _ = require( "underscore" );
var TrafficFormatter = require( "./TrafficFormatter" );
var ListenerHost = require( "./ListenerHost" );

module.exports = function( )
{
   var _this = this;
   var _fmt = new TrafficFormatter( );
   var _listeners = new ListenerHost( this );
   var _parser = new DOMParser( );
   var _regexes = {};

   this.decode = function( line )
   {
      if (!line.length)
         return;

      var params;
      var initial = line.charAt( 0 );
      switch (initial)
      {
      case "(":
			if (line == "(Communications error.")
				return _listeners.raise( "onKicked" );
         return _decodeChat( line );
      case "]":
         if (params = _fmt.parse( "]q %w %d", line, ["patchID","patchNum"] ))
            return _listeners.raise( "onUsePatch", params.patchID, params.patchNum );
         if (params = _fmt.parse( "]o%s", line, ["mapName"] ))
            return _listeners.raise( "onLoadMap", params.mapName );
         if (params = _fmt.parse( "]J%s", line, ["mapName"] ))
            return _listeners.raise( "onEnterMap", params.mapName );
         if (params = _fmt.parse( "]%%0%s", line, ["player"]))
            return _listeners.raise( "onOnlineCheckResult", params.player, false );
         if (params = _fmt.parse( "]%%1%s", line, ["player"]))
            return _listeners.raise( "onOnlineCheckResult", params.player, true );
         break;
      case "<":
         if (params = _fmt.parse( "<%4N%2N%2N%2N%S%s", line,
            ["uid","x","y", "frame", "name", "colors"] ))
            return _listeners.raise( "onCreatePlayer",
               params.uid, params.name, params.x, params.y, params.frame );
         break;
      case "/":
         if (params = _fmt.parse( "/%4N%2N%2N%2N%4N", line,
            ["uid","x","y", "frame", "unk"] ))
            return _listeners.raise( "onMovePlayer",
               params.uid, params.x, params.y, params.frame );
         break;
      case ")":
         if (params = _fmt.parse( ")%4N", line, ["uid"] ))
            return _listeners.raise( "onRemovePlayer",
               params.uid );
         break;
      case "@":
         if (params = _fmt.parse( "@%2n%2n", line, ["x","y"] ))
            return _listeners.raise( "onSetCamera",
               params.x, params.y );
         if (params = _fmt.parse( "@%2n%2n%2n%2n", line, ["fromX","fromY","toX","toY"] ))
            return _listeners.raise( "onMoveCamera",
               params.fromX, params.fromY, params.toX, params.toY );
         break;
      default:
         break;
      }
   }

   var _decodeChat = function( line )
   {
      line = line.substr( 1 );
      var m;
      if (m = _regexes["chat-speech"].exec( line ))
         return _listeners.raise( "onChatSpeech", m[1], m[2] );
      if (m = _regexes["chat-whisper"].exec( line ))
         return _listeners.raise( "onChatWhisper", m[1], m[2] );
      if (m = _regexes["chat-emote"].exec( line ))
         return _listeners.raise( "onChatEmote", m[1], m[2] );
      if (m = _regexes["chat-speech-echo"].exec( line ))
         return _listeners.raise( "onChatSpeechEcho", m[1] );
      if (m = _regexes["chat-whisper-echo"].exec( line ))
         return _listeners.raise( "onChatWhisperEcho", m[2], m[1] );

      _listeners.raise( "onChat", line );
   }

   _regexes = {
      "chat-speech": /^<name ?[^>]*>([^<]+)<\/name>: (.*)$/,
      "chat-emote": /^<font color='emote'><name ?[^>]*>([^<]+)<\/name> ?(.+)<\/font>$/,
      "chat-whisper": /^<font color='whisper'>\[ <name ?[^>]*>([^<]+)<\/name> whispers, "(.*)" to you. ]<\/font>$/,
      "chat-speech-echo": /^<font color='myspeech'>You say, "(.*)"<\/font>$/,
      "chat-whisper-echo": /^<font color='whisper'>\[ You whisper "(.*)" to <name ?[^>]*>([^<]+)<\/name>. ]<\/font>$/
   };
};
