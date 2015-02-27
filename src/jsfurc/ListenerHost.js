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

   this.add = function( listener )
   {
      _listeners.push( listener );
      return _this;
   }

   this.remove = function( listener )
   {
      _listeners = _.without( _listeners, listener );
      return _this;
   }

   if (obj)
   {
      obj["addListener"] = _this.add;
      obj["removeListener"] = _this.remove;
   }
}
