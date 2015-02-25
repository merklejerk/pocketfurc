var _ = require( "underscore" );

module.exports = function( obj )
{
   var _this = this;
   var _listeners = [];

   this.raise = function( event /*, *args */ )
   {
      var args = _.rest( arguments, 1 );
      _.each( _listeners,
         function( listener ) {
            if (event in listener)
               listener[event].apply( null, args );
         } );
   }

   this.addListener = function( listener )
   {
      _listeners.push( listener );
      return _this;
   }

   this.removeListener = function( listener )
   {
      _listeners = _.without( listeners, listener );
      return _this;
   }

   if (obj)
   {
      obj["addListener"] = _this.addListener;
      obj["removeListener"] = _this.removeListener;
   }
}
