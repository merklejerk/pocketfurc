var $ = require( "jquery" );
var _ = require( "underscore" );
var jsFurcUtil = require( "./jsfurc/Util" );

module.exports = new (function( ) {

	var _this = this;

	this.totalHeight = function( selector )
	{
		var h = 0;
		selector.each( function( i ) {
		  h += $(this).outerHeight( );
		} );
		return h;
	}

	this.time = function( )
	{
		return jsFurcUtil.time( );
	}

	this.createTimestamp = function( )
	{
		var date = new Date( );
		var h = _this.padDigits( date.getHours( ), 2 );
		var m = _this.padDigits( date.getMinutes( ), 2 );
		return "[" + h + ":" + m + "]";
	 }

	this.createAgeString = function( seconds )
	{
		if (seconds < 15)
			return "Just now";
		if (seconds < 60)
			return "Less than a minute";
		if (seconds < 2*60)
			return "A minute";
		if (seconds < 3600)
			return Math.floor( seconds / 60 ) + " minutes";
		if (seconds <= 3600*1.25)
			return "An hour";
		if (seconds <= 3600*1.5)
			return "Over an hour";
		if (seconds < 3600*1.6)
			return "An hour and a half";
		if (seconds < 3600*2)
			return "Over an hour and a half";
		if (seconds < 3600*24)
			return Math.floor( seconds / 3600 ) + " hours";
		if (seconds < 3600*24*2)
			return "A day";
		return Math.floor( seconds / 3600 / 24 ) + " days";
	}

	this.padDigits = function( num, width )
	{
		var s = "" + Math.abs( num );
		if (s.length > width)
			s = _.last( s, width ).join( "" );
		while (s.length < width)
			s = "0" + s;
		if (num < 0)
			return "-" + s;
		return s;
	}

} )( );
