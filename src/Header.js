var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var PopupMenu = require( "./PopupMenu" );
var jsfurcConstants = require( "./jsfurc/Constants" );

module.exports = function( app, $container )
{
	var _this = this;
	var _lastStatusMessageTime = 0;
	var _menu;

	this.getApp = function( )
	{
		return app;
	}

	var _initPopupMenu = function( )
	{
		_menu = new PopupMenu( [
			[
				{
					"id": "ignores",
					"label": "List Ignores",
				},
				{
					"id": "log-out",
					"label": "Log Out"
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

	var _toggleReconnectButton = function( toggle )
	{
		$container.find( ".reconnect-button" ).toggle( toggle );
		_this.fit( );
	}

	var _toggleMenu = function( toggle )
	{
		var settingsButton = $container.find( ".menu-button" );
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

	var _onMenuPick = function( id, checked )
	{
		switch (id)
		{
			case "ignores":
				app.listIgnores( );
				break;
			case "log-out":
				app.logOut( );
				break;
			case "about":
				app.about( );
				break;
		}
	}

	var _onMenuOut = function( )
	{
		_toggleMenu( false );
	}

	this.setPlayersVisible = function( count )
	{
		_setButtonCount( $container.find( ".players-visible-button" ), count );
	}

	this.setFriendsOnline = function( count )
	{
		_setButtonCount( $container.find( ".friends-online-button" ), count );
	}

	var _setButtonCount = function( $button, count )
	{
		if (count == 0)
			$button.hide( );
		else
			$button.show( );
		$button.find( ".count" ).text( "" + count );
		_this.fit( );
	}

	this.pushStatus = function( msg, level )
	{
		$container.find( "> .status" )
			.stop( )
			.text( msg )
			.css( "color", level >= jsfurcConstants.LOG_LEVEL_WARNING ? "red" : "white" )
			.show( );
		_lastStatusMessageTime = util.time( );
	}

	var _updateStatus = function( )
	{
		if (util.time( ) - _lastStatusMessageTime > 10.0)
		{
			var status = $container.find( "> .status" );
			if (status.css( "display" ) != "none")
				status.fadeOut( 2000 );
		}
	}

	this.fit = function( )
	{
		var $header = $container.find( "> .header" );
		var $logoText = $header.find( "> .left > .logo-text" );
		$logoText.show( );
		var widthWithText = $header.width( );
		$logoText.hide( );
		var widthWithoutText = $header.width( );
		$logoText.toggle( widthWithText <= widthWithoutText );
		if (_menu)
			_menu.fit( );
	}

	$container.prepend( templates["app-header"]( ) );
	$container.find( ".reconnect-button" )
		.on( "click", function( ) {
			app.reconnect( );
		} );
	$container.find( ".players-visible-button" )
		.on( "click", function( ) {
			app.showPlayersVisible( );
		} );
	$container.find( ".friends-online-button" )
		.on( "click", function( ) {
			app.showFriendsOnline( );
		} );
	$container.find( ".menu-button" )
		.on( "click", function( e ) {
			_toggleMenu( true );
			e.preventDefault( );
		} );
	_initPopupMenu( );
	app.on( "disconnect", function( ) {
		_toggleReconnectButton( true );
		_this.setFriendsOnline( 0 );
		_this.setPlayersVisible( 0 );
		} );
	app.on( "connect", function( ) {
		_toggleReconnectButton( false );
		} );
	/*
	app.on( "login", function( ) {
		_toggleReconnectButton( false );
		_toggleLoggedIn( true );
		} );*/
	setInterval( _updateStatus, 500 );
	this.fit( );
}
