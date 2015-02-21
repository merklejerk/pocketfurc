var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var ModalCover = require( "./ModalCover" );
var RetrieveToon = require( "./jsfurc/RetrieveToon" );
var Eventful = require( "./jsfurc/Eventful" );
var Constants = require( "./jsfurc/Constants" );

module.exports = function( )
{
   var _this = this;
   var _modal;
   var _elem = $(templates["login-prompt"]( ));
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
            _elem.find( "> .contents .name" ).focus( );
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
      var name = _elem.find( "> .contents .name" ).val( );
      var password = _elem.find( "> .contents .password" ).val( );
      _fetchToon( name, password );
   }

   var _fetchToon = function( name, password )
   {
      _clearError( );
      _setWorking( true );
      _log( "Fetching character info..." );
      RetrieveToon.retrieve( name, password,
         function( err, info ) {
            _setWorking( false );
            if (err)
               _setError( "Invalid login." )
            else
            {
               _log( "Character info retrieved." );
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

   _elem.find( "> .contents .login-button" )
      .on( "click", _onSubmitClicked );
   _elem.find( "> .contents input" )
      .on( "change", _validateInput )
      .on( "keyup", _onKeyUp );
};
