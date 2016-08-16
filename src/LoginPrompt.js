var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var Eventful = require( "./jsfurc/Eventful" );
var LoginDialog = require( "./LoginDialog.js" );
var CharacterPickerDialog = require( "./CharacterPickerDialog.js" );

module.exports = function( )
{
	var _this = this;
	var _done;
	var _events = new Eventful( this );
	var _login = new LoginDialog( );
	var _picker = new CharacterPickerDialog( );

	this.prompt = function( parent, done )
	{
		_done = done || _.noop;
		_login.show( parent, function( accountInfo ) {

			var fields = _login.getFields( );
			if (fields.remember)
				_saveCredentials( fields.email, fields.password  );
			else
				_unsaveCredentials( );
			
			_picker.show( accountInfo, parent, function( characterId ) {
						success = true;
						_done( accountInfo, characterId );
					}, function( ) {
						_this.prompt( parent, done );
					} );
		} );
	}

	var _populate = function( )
	{
		chrome.storage.sync.get( "credentials",
			function( items ) {
				if ("credentials" in items)
				{
					var credentials = items["credentials"];
					_login.setFields( credentials.email, credentials.password, true );
				}
		} );
	}

	var _saveCredentials = function( email, password )
	{
		chrome.storage.sync.set( {
			"credentials": {
				"email": email,
				"password": password
			}
		} );
	}

	var _unsaveCredentials = function( )
	{
		chrome.storage.sync.remove( "credentials" );
	}

	this.isOpen = function( )
	{
		return _login.isOpen( ) || _picker.isOpen( );
	}

	this.close = function( )
	{
		if (_login.isOpen( ))
			_login.close( );
		if (_picker.isOpen( ))
			_picker.close( );
	}

	this.clear = function( )
	{
		_login.clear( );
		_picker.clear( );
		_unsaveCredentials( );
	}

	var _log = function( msg, lvl )
	{
		_events.raise( "log", msg, lvl )
	}

	this.fit = _.debounce( function( )
	{
		if (_login.isOpen( ))
			_login.fit( );
		if (_picker.isOpen( ))
			_picker.fit( );
	}, 100 );

	_login.on( "log", _log );
	_populate( );
};
