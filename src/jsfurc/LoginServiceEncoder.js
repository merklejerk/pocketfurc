define( ["underscore", "./Util", "./TrafficFormatter"],
	function( _, Util, TrafficFormatter ) {

return function( )
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
		return fn( fmt, seq, params );
	}
};

} )
