var $ = require( "jquery" );
var _ = require( "underscore" );
var sanitizeHtml = require( "sanitize-html" );
var Util = require( "./jsfurc/Util" );

module.exports = function( ){

   var _this = this;

   this.encode = function( content )
   {
      content =  _sanitize( content );
      var root = $("<div />").html( content );
      _insertLinks( root );
      _transformUsernames( root );
      _fixLinks( root );
      var html = root.html( );
      root.remove( );
      return html;
   }

   var _sanitize = function( content )
   {
      return sanitizeHtml( content, {
         "allowedTags": ['a','b','i','u','name'],
         "allowedAttributes": {
            'a': ["href","target"],
         },
         "allowedSchemes": ["http","https","ftp"],
         "transformTags": {
            'a': sanitizeHtml.simpleTransform( 'a', {"target": "_blank" } )
         }
      } );
   }

   var _insertLinks = function( root )
   {
      var textNodes = _extractNonLinkedTextNodes( root.get( 0 ) );
      _.each( textNodes,
         function( textNode ) {
            var html = _insertLinksIntoHTML( _.escape( textNode.textContent ) );
            $(textNode).replaceWith( html );
         } );
      return root;
   }

   var _transformUsernames = function( root )
   {
      root.find( "name" ).each( function( ) {
         var $this = $(this);
         var username = $this.text( ).replace( /\|/g, " " );
         var canonicalName = Util.createCanonicalPlayerName( username );
         var span = $("<span></span>")
            .attr( "class", "username" )
            .attr( "data-username", canonicalName )
            .text( username );
         $this.replaceWith( span );
      } );
   }

   var _fixLinks = function( root )
   {
      root.find( "a[href]" ).each(
         function( ) {
            var a = $(this);
            var href = a.attr( "href" );
            if (href.indexOf( "http://" ) != 0 &&
               href.indexOf( "https://" ) != 0 &&
               href.indexOf( "ftp://" ) != 0)
               a.attr( "href", "http://" + href );
         } );
   }

   var _extractNonLinkedTextNodes = function( node, nodes )
   {
      nodes = nodes || [];
      var outerFn = arguments.callee;
      _.each( node.childNodes,
         function( child ) {
            if (child.nodeType == 3)
               nodes.push( child );
            if (child.tagName == "A")
               return;
            else
               outerFn( child, nodes );
         } );
      return nodes;
   }

   var _insertLinksIntoHTML = function( text )
   {
      var html = "";
      var pos = 0;
      while (true)
      {
         var part = text.substr( pos );
         var m;
         var href;
         if (m = /\bhttps?:\/\/\S+/i.exec( part ))
            href = m[0];
         else if (m = /\bftp:\/\/\S+/i.exec( part ))
            href = m[0];
         else if (m = /\b\w+\.\w+\.\w{2,4}(\/\S+)?/i.exec( part ))
            href = "http://" + m[0];
         else
            break;
         html += part.substring( 0, m.index );
         html += "<a href=\"" + encodeURI( href ) + "\" target=\"_blank\">" + m[0] + "</a>";
         pos += m.index + m[0].length;
      }
      html += text.substr( pos );
      return html;
   }
};
