define( "util", ["jquery.all", "underscore", "jsfurc/Util"],
	function( $, _, jsFurcUtil ) {

return new (function( ) {

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
			return "Less than a minute ago";
		if (seconds < 2*60)
			return "A minute ago";
		if (seconds < 3600)
			return Math.floor( seconds / 60 ) + " minutes ago";
		if (seconds <= 3600*1.25)
			return "An hour ago";
		if (seconds < 3600*2)
			return "Over an hour ago";
		if (seconds < 3600*24)
			return Math.floor( seconds / 360 ) + " hours ago";
		if (seconds < 3600*24*2)
			return "A day ago";
		return Math.floor( seconds / 360 / 24 ) + " days ago";
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

} );
