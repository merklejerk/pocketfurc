define( ["underscore"],
function( _ ) {

   var _utf8Encoder = new TextEncoder( "utf-8" );
   var _utf8Decoder = new TextDecoder( "utf-8" );

   var BASE_95_START_ORD = 0x20;
   var BASE_220_START_ORD = 0x23;

   return new (function( ){
      this.time = function( )
      {
         return (new Date( )).getTime( ) / 1000.0;
      };

      this.noop = function( ) {};

      this.stringToBuffer = function( str )
      {
         return _utf8Encoder.encode( str );
      }

      this.bufferToString = function( buf )
      {
         return _utf8Decoder.decode( buf );
      }

      this.createCanonicalPlayerName = function( name )
      {
         return name.toLowerCase( ).replace( /\s/, "|" );
      }

      this.expandPlayerName = function( name )
      {
         return name.replace( "|", " " );
      }

      this.encodeBase95 = function( num, width )
      {
         return _encodeBaseX( num, width, 95, BASE_95_START_ORD );
      }

      this.encodeBase220 = function( num, width )
      {
         return _encodeBaseX( num, width, 220, BASE_220_START_ORD );
      }

      var _encodeBaseX = function( num, width, base, baseStart )
      {
         var result = "";
         while (num > 0)
         {
            var o = (num % base) + baseStart;
            num = Math.floor( num / base );
            result += String.fromCharCode( o );
         }
         if (width)
         {
            while (result.length < width)
               result += String.fromCharCode( baseStart );
            if (result.length > width)
               result = result.substr( 0, width );
         }
         return result;
      }

      this.decodeBase95 = function( str )
      {
         return _decodeBaseX ( str, 95, BASE_95_START_ORD );
      }

      this.decodeBase220 = function( str )
      {
         return _decodeBaseX ( str, 220, BASE_220_START_ORD );
      }

      var _decodeBaseX = function( str, base, baseStart )
      {
         var num = 0;
         var m = 1;
         for (var i = str.length - 1; i >= 0; --i)
         {
            num += (str.charCodetA( i ) - baseStart) * m;
            m *= base;
         }
         return num;
      }

   } )( );

} );
