var $ = require( "jquery" );
var _ = require( "underscore" );
var SmileyHelper = require( "./SmileyHelper" );

module.exports = new (function( ) {

	var _this = this;

	this.isSelectionBackwards = function( sel )
	{
		if (sel.anchorNode.isSameNode( sel.focusNode ))
			return sel.anchorOffset > sel.focusOffset;
		var pos = sel.anchorNode.compareDocumentPosition( sel.focusNode );
		return !(pos & Node.DOCUMENT_POSITION_FOLLOWING);
	}

	this.isSelectionInContainer = function( container )
	{
		var sel = window.getSelection( );
		return container.contains( sel.anchorNode )
			|| container.contains( sel.focusNode );
	}

	this.getSelectionOffsets = function( container )
	{
		var offs = { "start": 0, "end": 0 };
		var sel = window.getSelection( );
		if (sel.rangeCount == 0)
			return offs;
		var foundStart = false, foundEnd = false;
		var pos = 0;
		(function( node ) {
			if (sel.anchorNode.isSameNode( node ))
			{
				offs.start = pos;
				if (node.nodeType == Node.TEXT_NODE)
					offs.start += sel.anchorOffset;
				foundStart = true;
			}
			if (sel.focusNode.isSameNode( node ))
			{
				offs.end = pos;
				if (node.nodeType == Node.TEXT_NODE)
					offs.end += sel.focusOffset;
				foundEnd = true;
			}
			pos += _getNodeOffsetLength( node );
			if (!foundStart || !foundEnd)
				_.each( node.childNodes, arguments.callee );
		} )( container );
		if (!foundStart)
			offs.start = offs.end;
		if (!foundEnd)
			offs.end = offs.start;
		return offs;
	}

	var _getNodeOffsetLength = function( node )
	{
		var nodeLength = 0;
		if (node.nodeType == Node.TEXT_NODE)
			nodeLength = node.length;
		else if (node.nodeType == Node.ELEMENT_NODE &&
				  node.tagName == 'IMG')
			nodeLength = 1;
		return nodeLength;
	}

	this.getContainerLength = function( container )
	{
		var len = 0;
		(function( node ) {
			len += _getNodeOffsetLength( node );
			_.each( node.childNodes, arguments.callee );
		} )( container );
		return len;
	}

	this.offsetsToRange = function( offsets, container )
	{
		var minOff = Math.min( offsets.start, offsets.end );
		var maxOff = Math.max( offsets.start, offsets.end );
		var startNode = null, endNode = null;
		var startOffset = 0, endOffset = 0;
		var pos = 0;
		_.each( container.childNodes, function( node ) {
			var nodeLength = _getNodeOffsetLength( node );
			pos += nodeLength;
			if (!startNode && pos >= minOff)
			{
				startNode = node;
				startOffset = nodeLength - (pos - minOff);
			}
			if (!endNode && pos >= maxOff)
			{
				endNode = node;
				endOffset = Math.max( 0, nodeLength - (pos - maxOff) );
			}
			if (!startNode || !endNode)
				_.each( node.childNodes, arguments.callee );
		} );
		if (pos == 0)
		{
			startNode = container;
			endNode = container;
		}
		var range = new Range( );
		if (startNode && endNode)
		{
			range.setStart( startNode, startOffset );
			range.setEnd( endNode, endOffset );
		}
		return range;
	}

	this.selectOffsets = function( offsets, container )
	{
		var range = _this.offsetsToRange( offsets, container );
		var sel = window.getSelection( );
		sel.removeAllRanges( );
		sel.addRange( range );
		if (offsets.start > offsets.end)
			_this.reverseSelection( sel );
		return sel;
	}

	this.reverseSelection = function( sel )
	{
		sel = sel || window.getSelection( );
		if (!sel.isCollapsed)
		{
			if (!this.isSelectionBackwards( sel ))
			{
				var anchorNode = sel.anchorNode;
				var anchorOffset = sel.anchorOffset;
				sel.collapseToEnd( );
				sel.extend( anchorNode, anchorOffset );
			}
			else
			{
				var focusNode = sel.focusNode;
				var focusOffset = sel.focusOffset;
				sel.collapseToStart( );
				sel.extend( focusNode, focusOffset );
			}
		}
	}

	this.prepareContent = function( container )
	{
		var result = document.createElement( "DIV" );
		_.each( container.childNodes,
			function( child ) {
			_prepareNode( child, result );
		} );
		return result;
	}

	var _prepareNode = function( node, preparedParent )
	{
		if (node.nodeType == Node.TEXT_NODE)
			_prepareTextNode( node, preparedParent );
		else if (node.nodeType == Node.ELEMENT_NODE)
			_prepareElementNode( node, preparedParent );
	}

	var _prepareElementNode = function( node, preparedParent )
	{
		// Skip elements that are effectively empty.
		if (!$(node).text( ).length)
			return;
		switch (node.tagName)
		{
			case "SPAN":
				if (node.classList.contains( "bold" ))
				{
					preparedParent.appendChild( document.createElement( "B" ) );
					preparedParent = preparedParent.lastChild;
				}
				if (node.classList.contains( "underline" ))
				{
					preparedParent.appendChild( document.createElement( "U" ) );
					preparedParent = preparedParent.lastChild;
				}
				if (node.classList.contains( "italic" ))
				{
					preparedParent.appendChild( document.createElement( "I" ) );
					preparedParent = preparedParent.lastChild;
				}
				if (node.classList.contains( "link" ))
				{
					preparedParent.appendChild( document.createElement( "A" ) );
					preparedParent = preparedParent.lastChild;
					preparedParent.setAttribute( "href", node.getAttribute( "data-href" ) );
				}
				break;
			case "B":
				preparedParent.appendChild( document.createElement( "B" ) );
				preparedParent = preparedParent.lastChild;
				break;
			case "I":
				preparedParent.appendChild( document.createElement( "I" ) );
				preparedParent = preparedParent.lastChild;
				break;
			case "U":
				preparedParent.appendChild( document.createElement( "U" ) );
				preparedParent = preparedParent.lastChild;
				break;
			case "A":
				preparedParent.appendChild( document.createElement( "A" ) );
				preparedParent = preparedParent.lastChild;
				preparedParent.setAttribute( "href", node.getAttribute( "href" ) );
				break;
			default:
				break;
		}
		_.each( node.childNodes,
			function( child ) {
				_prepareNode( child, preparedParent );
		} );
	}

	var _prepareTextNode = function( node, preparedParent )
	{
		var value = node.nodeValue.replace( "\xA0", " " );
		value = SmileyHelper.encodeEmojis( value );
		if (value.length > 0)
			preparedParent.appendChild( new Text( value ) );
	}

})( );
