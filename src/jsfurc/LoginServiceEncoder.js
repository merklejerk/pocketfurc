var _ = require( "underscore" );
var Util = require( "./Util" );
var TrafficFormatter = require( "./TrafficFormatter" );

module.exports = function( )
{
	var _this = this;
	var _fmt = new TrafficFormatter( );

	this.login = function( params, pattern )
	{
		return _format( "connect %p %s", ["name","password"], params, pattern );
	}

	this.register = function( params, pattern )
	{
		return _format( "create %p %w %w", ["name","password", "email"], params, pattern );
	}

	var _format = function( fmt, seq, params, pattern )
	{
		var fn = pattern ? _fmt.partial : _fmt.format;
		return _stripLineBreaks( fn( fmt, seq, params ) );
	}

	var _stripLineBreaks = function( text )
	{
		return text.replace( /[\n\r]/, " " );
	}

};
