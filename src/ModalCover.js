var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );

module.exports = function( container, child, clear, onClickOut )
{
   var _this = this;
   var _elem = $("<div class=modal-cover />");

   var _init = function( )
   {
      _this.fit( );

      _elem.toggleClass( "clear", !!clear );
      _elem.on( "click", _.bind( _onClick, _this ) );
      _elem.append( child );
      $("body").append( _elem );
   }

   this.destroy = function( )
   {
      child.detach( );
      _elem.remove( );
   }

   var _onClick = function( )
   {
      if (onClickOut)
         onClickOut( );
   }

   this.fit = function( )
   {
      var bounds = container.offset( );
      bounds.width = container.width( );
      bounds.height = container.height( );
      _elem.css( bounds );
   }

   _init( );
}
