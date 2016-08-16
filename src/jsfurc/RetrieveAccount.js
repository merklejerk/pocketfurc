var _ = require( "underscore" );
var $ = require( "jquery" );

module.exports = new (function( )
{
	var SERVICE_URL = "https://charon.furcadia.com/accounts/clogin.php";
	var CLIENT_KEY = "ZAWJuuaTpRrG-Furcadia-KFzsVWwpPM9t";
	var _this = this;

	this.retrieve = function( email, password, callback )
	{
		$.post( SERVICE_URL, {
				"k": CLIENT_KEY,
				"v": "31_0_aft",
				"u": _removeDiacritics( email ),
				"p": password
			} )
			.done( _.partial( _onRetrieveSuccess, email, password, callback ) )
			.fail( _.partial( callback, "Retrieval failed." ) );
	}

	var _onRetrieveSuccess = function( email, password, callback, data )
	{
		var accountNode = data.evaluate( '/characterselect/account', data, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
		var accountInfo = {
			"id": accountNode.getAttribute( "id" ),
			"email": accountNode.getAttribute( "email" ),
			"password": password,
			"characters": {}
		};
		_.each( _getCharacterNodesFromXML( data ), function( node ) {
			var descNode = data.evaluate( "desc", node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
			accountInfo.characters[node.getAttribute( "id" )] = {
				"id": node.getAttribute( "id" ),
				"name": node.getAttribute( "name" ),
				"owner": node.getAttribute( "owner" ),
				"colors": node.getAttribute( "colors" ),
				"lastLogin": new Date( node.getAttribute( "lastlogin" ) ),
				"desc": descNode.textContent
			};
		} );
		callback( null, accountInfo );
	}

	_getCharacterNodesFromXML = function( data )
	{
		var iterator = data.evaluate( '/characterselect/account/char',
			data, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
		var curr = iterator.iterateNext( );
		var results = [];
		while (curr)
		{
			results.push( curr );
			curr = iterator.iterateNext( );
		}
		return results;
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
