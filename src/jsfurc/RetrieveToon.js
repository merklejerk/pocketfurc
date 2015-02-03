define( ["underscore","jquery"],
	function( _, $ ) {

return new (function( )
{
	var SERVICE_URL = "http://www.furcadia.com/services/retrieve/retrieve.php4";
	var _this = this;

	this.retrieve = function( name, password, callback )
	{
		$.post( SERVICE_URL, {
				"user_name": name,
				"password": password,
				"cmd": "retrieve"
			} )
			.done( _.partial( _onRetrieveSuccess, callback ) )
			.fail( _.partial( callback, "Retrieval failed." ) );
	}

	var _onRetrieveSuccess = function( callback, data )
	{
		if (!_checkValidResponse( data, callback ))
			return;
		var name = /^Name=(.+)$/m.exec( data )[1];
		var pw = /^Password=(.+)$/m.exec( data )[1];
		var desc = /^Desc=(.*)$/m.exec( data )[1];
		var colors = /^Colors=(.*)$/m.exec( data )[1];
		callback( null, {
			"name": name,
			"password": pw,
			"description": desc,
			"colors": colors
		} );
	}

	var _checkValidResponse = function( data, callback )
	{
		if (!data.match( /^V2\.0 character$/m ))
		{
			callback( "Invalid response. Bad login credentials?" );
			return false;
		}
		return true;
	}

})( );

} );
