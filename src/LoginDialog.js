var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var ModalCover = require( "./ModalCover" );
var RetrieveAccount = require( "./jsfurc/RetrieveAccount" );
var Eventful = require( "./jsfurc/Eventful" );
var Constants = require( "./jsfurc/Constants" );

module.exports = function( )
{
	var _this = this;
	var _modal;
	var _elem = $(templates["login-dialog"]( ));
	var _open = false;
	var _done;
	var _events = new Eventful( this );

	this.show = function( parent, done )
	{
		_done = done || _.noop;
		_open = true;
		_modal = new ModalCover( parent, _elem );
		_setWorking( false );
		_clearError( );
		_elem.hide( );
		_.defer( function( ) {
				_elem.show( );
				_elem.addClass( "expanded" )
				_elem.find( "> .contents .email" ).focus( );
			} );
	}

	this.isOpen = function( )
	{
		return _open;
	}

	this.close = function( )
	{
		_elem.removeClass( "expanded" );
		_modal.destroy( );
		_modal = null;
		_open = false;
	}

	this.clear = function( )
	{
		_elem.find( "> .contents input" ).val( "" );
		_validateInput( );
	}

	var _submit = function( )
	{
		var email = _elem.find( "> .contents .email" ).val( );
		var password = _elem.find( "> .contents .password" ).val( );
		_fetchAccount( email, password );
	}

	var _fetchAccount = function( email, password )
	{
		_clearError( );
		_setWorking( true );
		_log( "Fetching character info..." );
		RetrieveAccount.retrieve( email, password,
			function( err, info ) {
				_setWorking( false );
				if (err)
					_setError( "Invalid login." )
				else
				{
					_log( "Account retrieved." );
					_this.close( );
					_done( info );
				}
		} );
	}

	var _setWorking = function( working )
	{
		_elem.find( "> .contents > .login-button" ).toggle( !working );
		_elem.find( "> .contents > .working" ).toggle( !!working );
	}

	var _clearError = function ( )
	{
		_elem.find( "> .contents > .error").hide( );
	}

	var _setError = function( msg )
	{
		_elem.find( "> .contents > .error" ).text( msg ).show( );
	}

	var _validateInput = function( )
	{
		var inputs = _elem.find( "> .contents .required" );
		_.each( inputs, function( x ) {
				$(x).toggleClass( "empty", !$(x).val( ) );
			} );
		var valid = _.every( inputs, function( x ) {
				return !!$(x).val( );
			} );
		_elem.find( "> .contents .login-button" )
			.toggleClass( "enabled", valid );
	}

	var _onSubmitClicked = function( e )
	{
		e.preventDefault( );
		if (_isSubmitEnabled( ))
			_submit( );
	}

	var _isSubmitEnabled = function( )
	{
		return _elem.find("> .contents .login-button").hasClass( "enabled" );
	}

	var _onKeyUp = function( e )
	{
		if (e.keyCode == 13)
		{
			e.preventDefault( );
			if (_isSubmitEnabled( ))
				_submit( );
		}
		else
			_validateInput( );
	}

	var _log = function( msg )
	{
		_events.raise( "log", msg, Constants.LOG_LEVEL_INFO )
	}

	this.fit = function( )
	{
		if (_modal)
			_modal.fit( );
	}

	this.getFields = function( )
	{
		var email = _elem.find( "> .contents .email" ).val( );
		var password = _elem.find( "> .contents .password" ).val( );
		var remember = _elem.find( "> .contents .remember input" ).prop( "checked" );
		return {
			"email": email,
			"password": password,
			"remember": remember
		};
	}

	this.setFields = function( email, password, remember )
	{
		_elem.find( "> .contents .email" ).val( email );
		_elem.find( "> .contents .password" ).val( password );
		_elem.find( "> .contents .remember input" ).prop( "checked", remember );
		_validateInput( );
	}

	_elem.find( "> .contents .remember" )
		.on( "click", function( e ) {
			var checkbox = _elem.find( "> .contents .remember input" );
			if (e.target != checkbox.get( 0 ))
				checkbox.prop( "checked", !checkbox.prop( "checked" ) );
		} );
	_elem.find( "> .contents .login-button" )
		.on( "click", _onSubmitClicked );
	_elem.find( "> .contents input" )
		.on( "change", _validateInput )
		.on( "keyup", _onKeyUp );
};
