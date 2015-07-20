var _ = require( "underscore" );
var $ = require( "jquery" );

module.exports = new (function( )
{
	var SERVICE_URL = "http://www.furcadia.com/services/retrieve/retrieve.php4";
	var _this = this;

	this.retrieve = function( name, password, callback )
	{
		$.post( SERVICE_URL, {
				"user_name": _removeDiacritics( name ),
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

	var _removeDiacritics = function( name )
	{
		name = name.replace( /[\xEC-\xEF]/ig, "i" );
		name = name.replace( /[\xE8-\xEB]/ig, "e" );
		name = name.replace( /[\xF2-\xF6\xF8]/ig, "o" );
		name = name.replace( /[\xE0-\xE6]/ig, "a" );
		name = name.replace( /[\xF9-\xFC\xB5]/ig, "u" );
		name = name.replace( /[\xE7]/ig, "c" );
		name = name.replace( /[\xFF\xFD\xA5]/ig, "y" );
		name = name.replace( /[\xD0]/ig, "d" );
		name = name.replace( /[^\x20-\x7E]/g, "" );
		return name;
	}

})( );
