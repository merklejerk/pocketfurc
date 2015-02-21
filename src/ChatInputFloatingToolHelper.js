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

   this.isSelectionBackwards = function( sel )
   {
      if (sel.anchorNode.isSameNode( sel.focusNode ))
         return sel.anchorOffset > sel.focusOffset;
      var pos = sel.anchorNode.compareDocumentPosition( sel.focusNode );
      return !(pos & Node.DOCUMENT_POSITION_FOLLOWING);
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

   this.offsetsToRange = function( offsets, container )
   {
      var minOff = Math.min( offsets.start, offsets.end );
      var maxOff = Math.max( offsets.start, offsets.end );
      var startNode = null, endNode = null;
      var startOffset = 0, endOffset = 0;
      var pos = 0;
      (function( node ) {
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
            endOffset = nodeLength - (pos - maxOff);
         }
         if (!startNode || !endNode)
            _.each( node.childNodes, arguments.callee );
      } )( container );
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

})( );
