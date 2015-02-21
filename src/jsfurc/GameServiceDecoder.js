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
         return _decodeChat( line );
      case "]":
            console.log( line );
         if (params = _fmt.parse( "]q %s %d", line, ["dreamID1","dreamID2"] ))
            return _listeners.raise( "onLoadDream", params.dreamID1, params.dreamID2 );
         if (params = _fmt.parse( "]o%s", line, ["mapName"] ))
            return _listeners.raise( "onLoadMap", params.mapName );
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
