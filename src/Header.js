var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var PopupMenu = require( "./PopupMenu" );

module.exports = function( app )
{
   var _this = this;
   var _elem = $(templates["app-header"]( ));
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
               "label": "Ignores",
               "checked": app.areIgnoresEnabled( )
            }
         ],
         [
            {
               "id": "log-out",
               "label": "Log Out",
               "disabled": app.isLoggedIn( )
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

   var _toggleReconnect = function( toggle )
   {
      _elem.find( ".reconnect-button" ).toggle( toggle );
   }

   this.toggleMenu = function( toggle )
   {
      var settingsButton = _elem.find( ".menu-button" );
      if (toggle && !_menu.isOpen( ))
      {
         _menu.toggleItemChecked( "ignores", app.areIgnoresEnabled( ) );
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
            app.toggleIgnores( !checked );
            break;
         case "log-out":
            app.logOut( );
            break;
         case "close":
            app.close( );n = function( loggedIn )
   {
      _menu.toggleItemEnabled( "log-out", loggedIn );
   }
            break;
         case "about":
            app.about( );
            break;
      }
   }

   var _onMenuOut = function( )
   {
      _this.toggleMenu( false );
   }

   var _toggleLoggedIn = function( loggedIn )
   {
      _menu.toggleItemEnabled( "log-out", loggedIn );
   }

   $("body").prepend( _elem );
   _elem.find( ".reconnect-button" )
      .on( "click", function( ) {
         app.reconnect( );
      } );
   _elem.find( ".menu-button" )
      .on( "click", function( e ) {
         _this.toggleMenu( true );
         e.preventDefault( );
      } );
   _initPopupMenu( );
   app.on( "disconnect", function( ) {
      _toggleReconnect( true );
      _toggleLoggedIn( false );
      } );
   app.on( "connect", function( ) {
      _toggleReconnect( false );
      } );
   app.on( "login", function( ) {
      _toggleReconnect( false );
      _toggleLoggedIn( true );
      } );
   //_toggleReconnect( app.isConnected( ) );
   //_toggleLoggedIn( app.isLoggedIn( ) );
}
