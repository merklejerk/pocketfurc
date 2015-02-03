define( ["jquery","underscore", "./TrafficFormatter", "./ListenerHost"],
	function( $, _, TrafficFormatter, ListenerHost ) {

return function( )
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

		var initial = line.charAt( 0 );
		if ("(" == initial)
			return _decodeChat( line );
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

      var dom = _parser.parseFromString( line, "text/html" );
      var text = $(dom).find("html:root > body").text( );
		_listeners.raise( "onChat", text );
	}

   _regexes = {
      "chat-speech": /^<name ?[^>]*>([^<]+)<\/name>: (.*)$/,
      "chat-emote": /^<font color='emote'><name ?[^>]*>([^<]+)<\/name> ?(.+)<\/font>$/,
      "chat-whisper": /^<font color='whisper'>\[ <name ?[^>]*>([^<]+)<\/name> whispers, "(.*)" to you. ]<\/font>$/,
      "chat-speech-echo": /^<font color='myspeech'>You say, "(.*)"<\/font>$/,
      "chat-whisper-echo": /^<font color='whisper'>\[ You whisper "(.*)" to <name ?[^>]*>([^<]+)<\/name>. ]<\/font>$/
   };
};

} );
