var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var PopupMenu = require( "./PopupMenu" );

module.exports = function( app )
{
   var _this = this;
   var _root = $(templates["app-header"]( ));
   var _menu;

   this.getApp = function( )
   {
      return app;
   }

   var _initPopupMenu = function( )
   {
      _menu = new PopupMenu( [
         /*
         [
            {
               "id": "ignores",
               "label": "Ignores",
               "checked": app.areIgnoresEnabled( )
            }
         ],*/
         [
            {
               "id": "log-out",
               "label": "Log Out",
               "disabled": app.isConnected( )
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
      _root.find( ".reconnect-button" ).toggle( toggle );
   }

   this.toggleMenu = function( toggle )
   {
      var settingsButton = _root.find( ".menu-button" );
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
            app.close( );
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

   this.setPlayersVisible = function( count )
   {
      _setButtonCount( _root.find( ".players-visible-button" ), count );
   }

   this.setFriendsOnline = function( count )
   {
      _setButtonCount( _root.find( ".friends-online-button" ), count );
   }

   var _setButtonCount = function( $button, count )
   {
      if (count == 0)
         $button.hide( );
      else
         $button.show( );
      $button.find( ".count" ).text( "" + count );
   }

   $("body").prepend( _root );
   _root.find( ".reconnect-button" )
      .on( "click", function( ) {
         app.reconnect( );
      } );
   _root.find( ".players-visible-button" )
      .on( "click", function( ) {
         app.showPlayersVisible( );
      } );
   _root.find( ".friends-online-button" )
      .on( "click", function( ) {
         app.showFriendsOnline( );
      } );
   _root.find( ".menu-button" )
      .on( "click", function( e ) {
         _this.toggleMenu( true );
         e.preventDefault( );
      } );
   _initPopupMenu( );
   app.on( "disconnect", function( ) {
      _toggleReconnect( true );
      _toggleLoggedIn( false );
      _this.setFriendsOnline( 0 );
      _this.setPlayersVisible( 0 );
      } );
   app.on( "connect", function( ) {
      _toggleReconnect( false );
      _toggleLoggedIn( true );
      } );
   /*
   app.on( "login", function( ) {
      _toggleReconnect( false );
      _toggleLoggedIn( true );
      } );*/
}
