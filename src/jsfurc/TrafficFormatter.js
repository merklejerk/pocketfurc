var _ = require( "underscore" );
var Util = require( "./Util" );

module.exports = function( )
{
	/**********************************

	FORMAT SPEC:
	-	%%			: Percent character. (No input)
	-	%s			: Raw string. (String)
	-	%w			: Word. (String)
	-	%d			: Digits. (Integer)
	-	%p			: Player name. (String)
	-	%[1-9]n	: Base-95 number. (Integer)
	-	%[1-9]N	: Base-220 number. (Integer)

	**********************************/

	var _this = this;
	var _decoderConstructors;
	var _encoderConstructors;

	this.format = function( fmt, sequence, params )
	{
		var formatted = "";
		var pos = 0;
		var tagIndex = 0;
		while (pos < fmt.length)
		{
			var i = fmt.indexOf( "%", pos );
			if (i == -1)
			{
				formatted += fmt.substring( pos );
				pos = fmt.length;
			}
			else
			{
				formatted += fmt.substring( pos, i );
				var tag = _getTag( fmt, i );
				pos = i + tag.length;
				var encoder = _createDecoder( tag );
				if (!encoder)
					formatted += "%";
				else
				{
					if (tagIndex >= sequence.length)
						throw "Missing sequence entry for tag \""
							+ tag + "\", index " + tagIndex + ".";
					if (!(sequence[tagIndex] in params))
						throw "Missing input parameter for format tag \"" +
							tag + "\", index " + tagIndex + ".";
						formatted += encoder( params[sequence[tagIndex++]] );
				}
			}
		}
		return formatted;
	}

	this.partial = function( fmt, sequence, params )
	{
		var formatted = "";
		var pos = 0;
		var tagIndex = 0;
		while (pos < fmt.length)
		{
			var i = fmt.indexOf( "%", pos );
			if (i == -1)
			{
				formatted += fmt.substring( pos );
				pos = fmt.length;
			}
			else
			{
				formatted += fmt.substring( pos, i );
				var tag = _getTag( fmt, i );
				pos = i + tag.length;
				var encoder = _createDecoder( tag );
				if (!encoder)
					formatted += "%%";
				else
				{
					if (tagIndex < sequence.length && sequence[tagIndex] in params)
						formatted += encoder( params[sequence[tagIndex++]] );
					else
						formatted += tag;
				}
			}
		}
		return formatted;
	}

	this.parse = function( fmt, subject, sequence )
	{
		var params = {};
		var fmtPos = 0;
		var subjPos = 0;
		var tagIndex = 0;
		while (fmtPos < fmt.length && subjPos < subject.length)
		{
			var i = fmt.indexOf( "%", fmtPos );
			if (i == -1)
			{
				if (!_match( fmt, subject, fmtPos, subjPos ))
					return false;
				subjPos = subject.length;
				fmtPos = fmt.length;
			}
			else
			{
				if (!_match( fmt, subject, fmtPos, subjPos, i, subjPos + (i - fmtPos) ))
					return false;
				var tag = _getTag( fmt, i );
				subjPos += i - fmtPos;
				fmtPos = i + tag.length;
				var decoder = _createDecoder( tag );
				if (!decoder)
					return false;
				var results = decoder( subject, subjPos );
				if (!results)
					return false;
				if (!results.value)
				{
					if (tagIndex >= sequence.length)
						throw "Missing sequence entry for tag "
							+ tag + ", index " + tagIndex + ".";
					params[sequence[tagIndex++]] = results.value;
				}
				subjPos += results.consumed;
			}
		}
		if (fmtPos == fmt.length && subjPos == subject.length)
			return params;
		return false;
	}

	var _match = function( strA, strB, startA, startB, endA, endB )
	{
		return strA.substring( startA, endA ) == strB.substring( startB, endB );
	}

	var _getTag = function( fmt, pos )
	{
		var tag = fmt.charAt( pos++ );
		if (tag != "%")
			throw "Not a format tag at index " + pos-1 + " of \"" + fmt +"\".";
		while (true)
		{
			var ch = fmt.charAt( pos++ );
			tag += ch;
			if (!_isDigit( ch ))
				break;
		}
		return tag;
	}

	var _isDigit = function( ch )
	{
		return ch >= '0' && ch <= '9';
	}

	var _createDecoder = function( tag )
	{
		var name = _getTagName( tag );
		if (!(name in _encoderConstructors))
			return null;
		var len = _getTagLength( tag );
		return _encoderConstructors[name]( len );
	}

	var _createMatcher = function( tag )
	{
		var name = _getTagName( tag );
		if (!(name in _decoderConstructors))
			return null;
		var len = _getTagLength( tag );
		return _decoderConstructors[name]( len );
	}

	var _getTagName = function( tag )
	{
		return tag.substring( tag.length - 1 );
	}

	var _getTagLength = function( tag )
	{
		var lenStr = tag.substring( 1, tag.length - 1 );
		if (lenStr.length > 0)
			return parseInt( lenStr );
		return 0;
	}

	var _decodeWithSimpleRegex = function( re, len, fn, subj, pos )
	{
		var m = re.exec( subj.substring( pos ) );
		if (m)
		{
			var s = m[0];
			if (len > 0)
				s = m[0].substr( 0, len );
			return { "consumed": m[0].length, "value": fn( s ) };
		}
	}

	_encoderConstructors = {
		"s": function( len ) {
				return function( input ) {
					return input;
				};
		},
		"w": function( len ) {
				return function( input ) {
					var m = /[^ ]*/.exec( input );
					return m[0];
				};
		},
		"d": function( len ) {
				return function( input ) {
					var s = "" + input;
					return s;
				};
		},
		"p": function( len ) {
				return function( input ) {
					return Util.createCanonicalPlayerName( input );
				};
		},
		"n": function( len ) {
				return function( input ) {
					return Util.encodeBase95( input, len );
				};
		},
		"N": function( len ) {
				return function( input ) {
					return Util.encodeBase220( input, len );
				};
		}
	};

	_decoderConstructors = {
		"%": function( ) {
				return function( subj, pos ) {
					if (pos < subj.length && subj[pos] == "%")
						return { "consumed": 2 };
				};
			},
		"s": function( len ) {
				return function( subj, pos ) {
					var count = subj.length - pos;
					if (len)
					{
						if (count >= len)
							count = Math.max( count, len );
					}
					if (count != len)
					return { "consumed": count,
						"value": subj.substr( pos, count ) };
				};
		},
		"w": function( len ) {
				var re = _.partial( _matchRegex, /^[^ ]+/ );
				return _.partial( _decodeWithSimpleRegex, re, len, function( str ) {
					return str;
				} );
		},
		"d": function( len ) {
				var re = _.partial( _matchRegex, /^\d+/ );
				return _.partial( _decodeWithSimpleRegex, re, len, parseInt );
		},
		"p": function( len ) {
				var re = _.partial( _matchRegex, /^\S+/ );
				return _.partial( _decodeWithSimpleRegex, re, len, Util.expandPlayerName );
		},
		"n": function( len ) {
				var re = _.partial( _matchRegex, /^[\x20-x7E]+/ );
				return _.partial( _decodeWithSimpleRegex, re, len, Util.decodeBase95 );
		},
		"N": function( len ) {
				var re = _.partial( _matchRegex, /^[\x23-x254]+/ );
				return _.partial( _decodeWithSimpleRegex, re, len, Util.decodeBase220 );
		}
	};
};
