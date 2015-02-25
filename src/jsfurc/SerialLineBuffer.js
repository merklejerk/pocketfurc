var _ = require( "underscore" );
var Util = require( "./Util" );

module.exports = function( length )
{
   length = length || 4096;
   var _this = this;
   var _buffer = new Uint8Array( length );
   var _pos = 0;

   this.put = function( ch )
   {
      _buffer[_pos++] = ch;
      if (_pos == _buffer.length || ch == 0x0A || ch == 0x13)
      {
         --_pos;
         var line = _this.pop( );
         if (line.length > 0)
            return line;
      }
   }

   this.pop = function( )
   {
      var line = Util.bufferToString( _buffer, 0, _pos );
      _pos = 0;
      return line;
   }
};
