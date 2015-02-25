var _ = require( "underscore" );

module.exports = function( obj )
{
   var _this = this;
   var _events = {};

   this.on = function( event, handler )
   {
      var events = event.split( /\s+/ );
      _.each( events,
         function( event ) {
         if (!(event in _events))
            _events[event] = [];
         _events[event] = _.union( _events[event], [handler] );
      } );
      return _this;
   }

   this.unsubscribe = function( event, handler )
   {
      if (event in _events)
         _events[event] = _.without( _events[event], handler );
      return _this;
   }

   this.clear = function( event )
   {
      if (event)
      {
         if (event in _events)
            _events[event] = [];
      }
      else
         _events = {};
      return _this;
   }

   this.raise = function( event /* *args */ )
   {
      if (event in _events)
      {
         var args = _.toArray( arguments ).slice( 1 );
         var results = [];
         _.each( _events[event],
            function( handler ) {
               results.push( handler.apply( obj, args ) );
            } );
         return results;
      }
   }

   if (obj)
   {
      obj["on"] = _this.on;
      obj["unsubscribe"] = _this.unsubscribe;
   }
};
