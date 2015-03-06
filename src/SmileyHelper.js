var _ = require( "underscore" );
require( "string.fromcodepoint" );

module.exports = new (function( ) {

	var _this = this;
	var _smileyToEmojiMap = {
		"#SA": String.fromCodePoint( 0x1F60A ),
		"#SB": String.fromCodePoint( 0x1F61D ),
		"#SC": String.fromCodePoint( 0x1F61E ),
		"#SD": String.fromCodePoint( 0x1F609 ),
		"#SE": String.fromCodePoint( 0x1F601 ),
		"#SF": String.fromCodePoint( 0x1F631 ),
		"#SG": String.fromCodePoint( 0x1F632 ),
		"#SH": String.fromCodePoint( 0x1F612 ),
		"#SI": String.fromCodePoint( 0x1F624 ),
		"#SJ": String.fromCodePoint( 0x1F614 ),
		"#SK": String.fromCodePoint( 0x1F60F ),
		"#SL": String.fromCodePoint( 0x1F622 ),
		"#SM": String.fromCodePoint( 0x1F3B5 ),
		"#SN": String.fromCodePoint( 0x1F483 ),
		"#SO": String.fromCodePoint( 0x1F49C ),
		"#SP": String.fromCodePoint( 0x1F634 ),
		"#SQ": String.fromCodePoint( 0x1F618 ),
		"#SR": String.fromCodePoint( 0x1F61A ),
		"#SS": String.fromCodePoint( 0x1F61D ),
		"#ST": String.fromCodePoint( 0x1F60B ),
		"#SU": String.fromCodePoint( 0x1F629 ),
		"#SV": String.fromCodePoint( 0x1F62B ),
		"#SW": String.fromCodePoint( 0x1F607 ),
		"#SX": String.fromCodePoint( 0x1F6BD )
	};
	var _emojiToSmileyMap = _.invert( _smileyToEmojiMap );
	var _emojiRegExps = _.mapObject( _emojiToSmileyMap,
		function( v, k ) { return new RegExp( k, "g" ); } );

	this.decodeEmojis = function( str )
	{
		var result = "";
		var pos = 0;
		var re = /#S[A-X]/g;
		var m;
		while (m = re.exec( str ))
		{
			var code = m[0];
			var prev = str.substring( pos, m.index );
			pos = re.lastIndex;
			result += prev;
			if (code in _smileyToEmojiMap)
				result += _smileyToEmojiMap[code];
			else
				result += code;
		}
		result += str.substring( pos );
		return result;
	}

	this.encodeEmojis = function( str )
	{
		_.each( _emojiToSmileyMap,
			function( code, emoji ) {
				var re = _emojiRegExps[emoji];
				str = str.replace( re, code );
		} );
		return str;
	}

})( );
