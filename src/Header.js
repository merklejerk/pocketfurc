var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var Eventful = require( "./jsfurc/Eventful" );
var PopupMenu = require( "./PopupMenu" );

module.exports = function( )
{
	var _this = this;
	var _elem = $(templates["app-header"]( ));
	var _events = new Eventful( this );
	var _menu;

	var _initPopupMenu = function( )
	{
		_menu = new PopupMenu( [
			[
				{
					"id": "raw-terminal",
					"label": "Raw Terminal",
					"checked": false
				},
				{
					"id": "log-out",
					"label": "Log Out",
					"disabled": true
				},
				{
					"id": "close",
					"label": "Close"
				}
			],
			[
				{
					"id": "about",
					"label": "About...",
					"centered": true
				}
			]
		] );
		_menu.on( "pick", _onMenuPick );
		_menu.on( "out", _onMenuOut );
	}

	this.toggleReconnect = function( toggle )
	{
		_elem.find( ".reconnect-button" ).toggle( toggle );
	}

	this.toggleMenu = function( toggle )
	{
		var settingsButton = _elem.find( ".menu-button" );
		if (toggle && !_menu.isOpen( ))
		{
			var pos = settingsButton.offset( );
			pos.top += settingsButton.height( );
			_menu.show( pos.left, pos.top );
		}
		else if (!toggle && _menu.isOpen( ))
		{
			_menu.hide( );
		}
	}

	var _onMenuPick = function( item, checked )
	{
		if (item == "raw-terminal")
		{
			if (!checked)
				_events.raise( "raw-terminal-on" );
			else
				_events.raise( "raw-terminal-off" );
		}
		else if (item == "log-out")
			_events.raise( "log-out" );
		else if (item == "close")
			_events.raise( "close" );
		else if (item == "about")
			_events.raise( "about" );
	}

	var _onMenuOut = function( )
	{
		_this.toggleMenu( false );
	}

	this.setLoggedIn = function( loggedIn )
	{
		_menu.toggleItemEnabled( "log-out", loggedIn );
	}

	$("body").prepend( _elem );
	_elem.find( ".reconnect-button" )
		.on( "click", function( ) {
			_events.raise( "reconnect" );
		} );
	_elem.find( ".menu-button" )
		.on( "click", function( e ) {
			_this.toggleMenu( true );
			e.preventDefault( );
		} );
	_initPopupMenu( );
}
