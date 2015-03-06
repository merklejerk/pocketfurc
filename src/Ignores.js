var _ = require( "underscore" );
var Util = require( "./jsfurc/Util" );

module.exports = function( ) {

	var _this = this;
	var _players = [];

	this.isIgnored = function( player )
	{
		player = Util.createCanonicalPlayerName( player );
		return _.contains( _players, player );
	}

	this.toggleIgnore = function( player, ignored )
	{
		player = Util.createCanonicalPlayerName( player );
		if (ignored)
			_players = _.union( _players, [player] );
		else
			_players = _.without( _players, player );
		_save( );
	}

	this.getList = function( )
	{
		return _.toArray( _players );
	}

	var _load = function( )
	{
		chrome.storage.sync.get( "ignores",
			function( items ) {
				_players =  _.map( items["ignores"],
					Util.createCanonicalPlayerName );
		} );
	}

	this.reload = function( )
	{
		_load( );
	}

	var _save = function( )
	{
		chrome.storage.sync.set( {
			"ignores": _.toArray( _players )
		} );
	}

	_load( );
}
