var $ = require( "jquery" );
var _ = require( "underscore" );


module.exports = new (function( ) {

	var _this = this;

	this.bubbleWrap = function( wrapper, maxAncestor )
	{
		wrapper = $(wrapper);
		maxAncestor = $(maxAncestor);
		var wrapperNode = wrapper.get( 0 );
		var maxAncestorNode = maxAncestor.get( 0 );
		// Bubble up the wrap to each parent that has only one child
		// to make the selection greedy.
		while (!wrapperNode.parentNode.isSameNode( maxAncestorNode ))
		{
			var parentNode = wrapperNode.parentNode;
			var parent = $(parentNode);
			parentNode.normalize( );
			if (parentNode.childNodes.length == 1)
			{
				wrapper.before( wrapper.contents( ) );
				wrapper.remove( );
				wrapper = parent.wrapAll( wrapper ).parent( );
				wrapperNode = wrapper.get( 0 );
			}
			else
				break;
		}
		return wrapperNode;
	}

	this.isolateNode = function( node, maxAncestorNode )
	{
		// Isolate and raise the node until it's a child of maxAncenstor.
		while (!node.parentNode.isSameNode( maxAncestorNode ))
		{
			if (_this.isNodeOnlyChild( node ))
			{
				$(node).unwrap( );
			}
			else if (node.previousSibling)
			{
				var before = _splitParentNodeBefore( node );
				if (_this.isNodeOnlyChild( node ))
					$(node).unwrap( );
				else
					before.parentNode.insertBefore( node, before.nextSibling );
			}
			else
				node.parentNode.parentNode.insertBefore( node, node.parentNode );
		}
	}

	this.isNodeOnlyChild = function( node )
	{
		return node.parentNode.childNodes.length == 1;
	}

	var _splitParentNodeBefore = function( node )
	{
		var parentNode = node.parentNode;
		var before = parentNode.cloneNode( false );
		var prevSiblings = _extractAllPreviousSiblings( node );
		parentNode.insertBefore( before, node );
		$(before).html( $(prevSiblings) ).unwrap( );
		return before;
	}

	var _extractAllPreviousSiblings = function( node )
	{
		var siblings = [];
		var parentNode = node.parentNode;
		while (node.previousSibling)
		{
			siblings.push( node.previousSibling );
			parentNode.removeChild( node.previousSibling );
		}
		return siblings;
	}

	this.stripTags = function( node, tags )
	{
		_.each ( _.toArray( node.childNodes ),
			function( child ) {
				_this.stripTags( child, tags );
				if (child.nodeType == Node.ELEMENT_NODE)
				{
					if (_.contains( tags, child.tagName ))
					{
						if (child.childNodes.length > 0)
							$(child).contents( ).unwrap( );
						else
							$(child).remove( );
					}
				}
		} );
	}

	this.wrapRange = function( range, wrapperNode, maxAncestorNode )
	{
		if (!range.collapsed)
		{
			range = _splitRangeBoundaries( range );
			_.each( maxAncestorNode.childNodes,
				function( node ) {
					if (!range.startContainer.isSameNode( node ) &&
						  node.contains( range.startContainer ))
						_.each( node.childNodes, arguments.callee );
					if (!range.endContainer.isSameNode( node ) &&
						  node.contains( range.endContainer ))
						_.each( node.childNodes, arguments.callee );
					else
					{
						if (range.comparePoint( node, 0 ) == 0)
							$(node).wrap( wrapperNode );
					}
				} );
		}
	}

	var _splitRangeBoundaries = function( range )
	{
		var startContainer = range.startContainer,
			 endContainer = range.endContainer;
		var startOffset = range.startOffset,
			 endOffset = range.endOffset;
		if (startContainer.isSameNode( endContainer ))
		{
			endOffset -= startOffset;
			if (startOffset > 0)
				startContainer = _splitNode( startContainer, startOffset ).nextSibling;
			if (endOffset < _getNodeLength( startContainer ))
				startContainer = _splitNode( startContainer, endOffset );
			endContainer = startContainer;
		}
		else
		{
			startContainer = _splitNode( startContainer, startOffset ).nextSibling;
			endContainer = _splitNode( endContainer, endOffset );
		}
		range = new Range( );
		range.setStart( startContainer, 0 );
		range.setEnd( endContainer, _getNodeLength( endContainer ) );
		return range;
	}

	var _getNodeLength = function( node )
	{
		if (node.nodeType == Node.TEXT_NODE)
			return node.length;
		else if (node.nodeType == Node.ELEMENT_NODE)
		{
			if (node.tagName == "IMG")
				return 1;
			return node.childNodes.length;
		}
		return 0;
	}

	var _splitNode = function( node, offset )
	{
		if (node.nodeType == Node.TEXT_NODE)
		{
			node.splitText( offset );
			return node;
		}

		var clone = node.cloneNode( false );
		var splitChildren = _.first( node.childNodes, offset );
		_.each( splitChildren, function( child ) {
			clone.appendChild( child );
		} );
		var parent = node.parentNode;
		parent.insertBefore( clone, node );
		return clone;
	}

})( );
