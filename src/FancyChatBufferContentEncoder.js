var $ = require( "jquery" );
var _ = require( "underscore" );
var sanitizeHtml = require( "sanitize-html" );

module.exports = function( ){

	var _this = this;

	this.encode = function( content )
	{
		return _insertLinks( _sanitize( content ) );
	}

	var _sanitize = function( content )
	{
		return sanitizeHtml( content, {
			"allowedTags": ['a','b','i','u'],
			"allowedAttributes": {
				'a': ["href","target"],
			},
			"allowedSchemes": ["http","https","ftp"],
			"transformTags": {
				'a': sanitizeHtml.simpleTransform( 'a', {"target": "_blank" } )
			}
		} );
	}

	var _insertLinks = function( content )
	{
		var root = $("<div />").html( content );
		var textNodes = _extractNonLinkedTextNodes( root.get( 0 ) );
		_.each( textNodes,
			function( textNode ) {
				var html = _insertLinksIntoHTML( _.escape( textNode.textContent ) );
				$(textNode).replaceWith( html );
			} );
		var html = root.html( );
		root.remove( );
		return html;
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
