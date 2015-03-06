var _ = require( "underscore" );

var BASE_95_START_ORD = 0x20;
var BASE_220_START_ORD = 0x23;

module.exports = new (function( ){
	this.time = function( )
	{
		return (new Date( )).getTime( ) / 1000.0;
	};

	this.noop = function( ) {};

	this.stringToBuffer = function( str )
	{
		var buf = new Uint8Array( str.length );
		for (var i = 0; i < str.length; ++i)
			buf[i] = str.charCodeAt( i );
		return buf;
	}

	this.bufferToString = function( buf, start, end )
	{
		var str = "";
		for (var i = start; i < end; ++i)
			str += String.fromCharCode( buf[i] );
		return str;
	}

	this.createCanonicalPlayerName = function( name )
	{
		return name.toLowerCase( ).replace( /\s/g, "|" );
	}

	this.expandPlayerName = function( name )
	{
		return name.replace( /\|/g, " " );
	}

	this.encodeBase95 = function( num, width )
	{
		return _encodeBaseX( num, width, 95, BASE_95_START_ORD );
	}

	this.encodeBase220 = function( num, width )
	{
		return _encodeBaseX( num, width, 220, BASE_220_START_ORD );
	}

	var _encodeBaseX = function( num, width, base, baseStart )
	{
		var result = "";
		while (num > 0)
		{
			var o = (num % base) + baseStart;
			num = Math.floor( num / base );
			result += String.fromCharCode( o );
		}
		if (width)
		{
			while (result.length < width)
				result += String.fromCharCode( baseStart );
			if (result.length > width)
				result = result.substr( 0, width );
		}
		return result;
	}

	this.decodeBase95 = function( str )
	{
		var num = 0;
		var m = 1;
		for (var i = str.length - 1; i >= 0; --i)
		{
			num += (str.charCodeAt( i ) - BASE_95_START_ORD) * m;
			m *= 95;
		}
		return num;
	}

	this.decodeBase220 = function( str )
	{
		var num = 0;
		var m = 1;
		for (var i = 0; i < str.length; ++i)
		{
			num += (str.charCodeAt( i ) - BASE_220_START_ORD) * m;
			m *= 220;
		}
		return num;
	}

} )( );
