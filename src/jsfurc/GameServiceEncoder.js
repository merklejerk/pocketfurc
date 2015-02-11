var $ = require( "jquery" );
var _ = require( "underscore" );
var TrafficFormatter = require( "./TrafficFormatter" );

module.exports = function( )
{
	var _this = this;
	var _fmt = new TrafficFormatter( );

	this.setPlayerDescription = function( params, pattern )
	{
		return _format( "desc %s", ["description"], params, pattern );
	}

	this.setPlayerColorsSpeciesRaw = function( params, pattern )
	{
		return _format( "color %s", ["colorCode"], params, pattern );
	}

	this.speak = function( params, pattern )
	{
		return _format( "\"%s", ["msg"], params, pattern );
	}

	this.emote = function( params, pattern )
	{
		return _format( ":%s", ["msg"], params, pattern );
	}

	this.whisper = function( params, pattern )
	{
		return _format( "wh %p %s", ["player","msg"], params, pattern );
	}

	this.mapReady = function( params, pattern )
	{
		return _format( "vascodagama", [], {}, pattern );
	}

	this.keepAlive = function( params, pattern )
	{
		return "iamhere";
	}

	this.lookAtPosition = function( params, pattern )
	{
		return _format( "l%2n%2n", ["x","y"], params, pattern );
	}

	this.quit = function( params, pattern )
	{
		return "quit";
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
