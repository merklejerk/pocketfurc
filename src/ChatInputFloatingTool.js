var $ = require( "jquery" );
var _ = require( "underscore" );
var ToolHelper = require( "./ChatInputFloatingToolHelper" );
var InputHelper = require( "./ChatInputHelper" );
var templates = require( "./templates" );

module.exports = function( container )
{
	var _this = this;
	var _startMeasure = $("<span style='display: inline-block' />");
	var _endMeasure = _startMeasure.clone( );
	var _lastSelRange = null;
	var _selection = null;
	var _selStyles = {};
	var _toolExpanded = false;
	var _tool = $(templates["chat-input-floating-tool"]( ));

	this.apply = function( )
	{
		_bake( );
	}

	this.update = function( force )
	{
		if (force || !_toolExpanded)
		{
			if (force || _hasSelectionChanged( ))
				_updateSelection( );
		}
		if (!_isSelectionEmpty( ))
		{
			_toggleTool( true );
			_moveTool( );
		}
		else
			_toggleTool( false );
	}

	var _hasSelectionChanged = function( )
	{
		var sel = window.getSelection( );
		if (!sel || sel.isCollapsed)
		{
			if (_lastSelRange)
				return true;
		}
		else
		{
			if (!_lastSelRange)
				return true;
			var range = sel.getRangeAt( 0 );
			return !_lastSelRange.startContainer.isSameNode( range.startContainer ) ||
				!_lastSelRange.endContainer.isSameNode( range.endContainer ) ||
				_lastSelRange.startOffset != range.startOffset ||
				_lastSelRange.endOffset != range.endOffset;
		}
		return false;
	}

	var _updateSelection = function( )
	{
		var hadSelection = !_isSelectionEmpty( );
		_selection = InputHelper.getSelectionOffsets( container.get( 0 ) );
		if (hadSelection)
		{
			_bake( );
			InputHelper.selectOffsets( _selection, container.get( 0 ) );
		}
		if (!_isSelectionEmpty( ))
		{
			_wrapSelection( );
			InputHelper.selectOffsets( _selection, container.get( 0 ) );
		}
		_saveSelection( );
	}

	var _saveSelection = function( )
	{
		var sel = window.getSelection( );
		if (!sel || sel.isCollapsed)
			_lastSelRange = null;
		else
			_lastSelRange = sel.getRangeAt( 0 ).cloneRange( );
	}

	var _isSelectionEmpty = function( )
	{
		return !_selection || (_selection.start == _selection.end);
	}

	var _wrapSelection = function( )
	{
		var wrapperNode = $("<span class='input-selection-wrapper'></span>").get( 0 );
		var range = InputHelper.offsetsToRange( _selection, container.get( 0 ) );
		// It would be nice to just use range.surroundContents or range.extractContents
		// here, but that results in a weird dangling text node that cannot be erased
		// in the current version of chrome, which possibly leads to crashing on mobile.
		ToolHelper.wrapRange( range, wrapperNode, container.get( 0 ) );
		$(".input-selection-wrapper").each( function( ) {
			ToolHelper.bubbleWrap( this, container );
			_extractStyles( $(this) );
		} );
	}

	var _removeIfEmptyTextNode = function( node )
	{
		if (node.nodeType == Node.TEXT_NODE && node.length == 0)
			node.parentNode.removeChild( node );
	}

	var _extractStyles = function( wrapper )
	{
		var styles = {};
		(function( node ) {
			if (node.nodeType != Node.ELEMENT_NODE)
				return;
			switch (node.tagName)
			{
				case 'A':
					styles.link = node.getAttribute( "HREF" );
					break;
				case 'B':
					styles.bold = true;
					break;
				case 'I':
					styles.italic = true;
					break;
				case 'U':
					styles.underline = true;
					break;
			}
			_.each( node.childNodes, arguments.callee );
		} )( wrapper.get( 0 ) );
		_selStyles = styles;
	}

	var _bake = function( )
	{
		var wrappers = container.find( ".input-selection-wrapper" );
		if (wrappers.hasClass( "bold" ))
			wrappers.wrap( $("<b></b>" ) );
		if (wrappers.hasClass( "italic" ))
			wrappers.wrap( $("<i></i>" ) );
		if (wrappers.hasClass( "underline" ))
			wrappers.wrap( $("<u></u>" ) );
		if (wrappers.hasClass( "link" ))
			wrappers.wrap( $("<a></a>" ).attr( "href", wrappers.attr( "data-href" ) ) );
		 wrappers.each( function( ) {
			  $(this).replaceWith( this.childNodes );
		 } );
		_collapseContents( );
	}

	var _collapseContents = function( )
	{
		// Remove emtpy tags
		container.find( "a:empty, i:empty, u:empty, b:empty" )
			.remove( );
		// Remove tags whose only children are the same thing.
		while (true)
		{
			var redundantTags =
				container.find( "a > a, b > b, i > i, u > u")
					.parent( );
			redundantTags = redundantTags.filter( function( e ) {
				return e.childNodes == 1;
			} );
			if (!redundantTags.length)
				break;
			redundantTags.replaceWith( redundantTags.children( ) );
		}
		container.get( 0 ).normalize( );
	}

	var _toggleTool = function( toggle )
	{
		if (toggle)
		{
			if (_tool.parent( ).length == 0)
			{
				_expandTool( false );
				$("body").append( _tool );
			}
		}
		else
			_tool.detach( );
	}

	var _moveTool = function( )
	{
		var range = InputHelper.offsetsToRange( _selection, container.get( 0 ) );
		var selBounds = range.getBoundingClientRect( );
		var pos = {
			"left": (selBounds.left + selBounds.width / 2) - _tool.outerWidth( ) / 2,
			"top": selBounds.top - _tool.outerHeight( )
			};
		_tool.css( pos );
	}

	var _onMouseEnter = function( )
	{
		_expandTool( true );
	}

	var _onMouseLeave = function( )
	{
		_expandTool( false );
	}

	var _expandTool = function( toggle )
	{
		var pos = _tool.offset( );
		pos.left += _tool.outerWidth( ) / 2;
		pos.top += _tool.outerHeight( );
		_tool.find( "> .content.maximized" ).toggle( toggle );
		_tool.find( "> .content.minimized" ).toggle( !toggle );
		_toolExpanded = toggle;
		pos.left -= _tool.outerWidth( ) / 2;
		pos.top -= _tool.outerHeight( );
		_tool.css( pos );
		if (toggle)
			_initToolStyles( );
		/*
		else if (container.is( ":focus" ))
			InputHelper.selectOffsets( _selection, container.get( 0 ) );*/
	}

	var _initToolStyles = function( )
	{
		_tool.find( "> .content.maximized .styles .button.bold" )
			.toggleClass( "on", !!_selStyles.bold );
		_tool.find( "> .content.maximized .styles .button.italic" )
			.toggleClass( "on", !!_selStyles.italic );
		_tool.find( "> .content.maximized .styles .button.underline" )
			.toggleClass( "on", !!_selStyles.underline );
		_tool.find( "> .content.maximized .link > .url" )
			.val( _selStyles.link || "" );
		_tool.find( "> .content.maximized .link > .overlay" )
			.toggle( !_selStyles.link );
	}

	var _toggleSelectionStyle = function( style, value )
	{
		var wrappers = container.find( ".input-selection-wrapper" );
		wrappers.toggleClass( style, !!value );
		if (style == "link")
			wrappers.attr( "data-href", value || "" );
		// Remove any inner styles.
		wrappers.each( function( ) {
			ToolHelper.stripTags( this, ["A","I","U","B"] );
			// Make the node top-level so it's outside the influence
			// of any inherited styles.
			ToolHelper.isolateNode( this, container.get( 0 ) );
		} );
		if (container.is( ":focus" ))
			InputHelper.selectOffsets( _selection, container.get( 0 ) );
	}

	var _onURLFocus = function( e )
	{
		_tool.find( "> .content.maximized > .link .overlay" ).hide( );
	}

	var _onURLBlur = function( e )
	{
		_tool.find( "> .content.maximized > .link .overlay" )
			.toggle( !$(this).val( ) );
	}

	var _onURLChange = function( e )
	{
		_toggleSelectionStyle( "link", $(this).val( ) );
	}

	var _onURLKeyUp = function( e )
	{
		if (e.keyCode == 13) // Enter
		{
			e.preventDefault( );
			container.focus( );
			_expandTool( false );
		}
	}

	var _onStyleButtonClicked = function( e )
	{
		e.preventDefault( );
		var style = "bold";
		if ($(this).hasClass( "italic" ))
			style = "italic";
		if ($(this).hasClass( "underline" ))
			style = "underline";
		$(this).toggleClass( "on" );
		_toggleSelectionStyle( style, $(this).hasClass( "on" ) );
		container.focus( );
	}

	var _onResize = function( )
	{
		if (_tool.parent( ).length > 0)
			_moveTool( );
	}

	setInterval( _this.update, 250 );
	$(window).on( "resize", _onResize );
	_expandTool( false );
	_tool.find( "> .content" )
		.on( "mouseenter", _onMouseEnter )
		.on( "mouseleave", _onMouseLeave );
	_tool.find( "> .content.maximized .url" )
		.on( "focus", _onURLFocus )
		.on( "blur", _onURLBlur )
		.on( "input", _onURLChange )
		.on( "keyup", _onURLKeyUp );
	_tool.find( "> .content.maximized .styles .button" )
		.on( "click", _onStyleButtonClicked );
}
