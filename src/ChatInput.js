var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var Eventful = require( "./jsfurc/Eventful" );
var ModalCover = require( "./ModalCover" );
var ChatInputFloatingTool = require( "./ChatInputFloatingTool" );
var InputHelper = require( "./ChatInputHelper" );

module.exports = function( container, app )
{
	var _this = this;
	var _elem = $(templates["chat-input"]( ));
	var _events = new Eventful( this );
	var _floatingTool = new ChatInputFloatingTool( _elem.children( ".text" ) );
	var _lastSelection = null;

	this.getApp = function( )
	{
		 return app;
	}

	this.focus = function( )
	{
		_elem.children( ".text" ).focus( );
	}

	var _onInput = function( e )
	{
		_cleanInput( );
		_refresh( );
	}

	var _onKeyDown = function( e )
	{
		if (!e.shiftKey)
		{
			if (e.keyCode == 13) // Enter
			 {
				 // Need to prevent this event from happening so
				 // selections don't get overwritten by a CR
				 // before submit.
				 e.preventDefault( );
			 }
		}
	}

	var _onKeyUp = function( e )
	{
		if (!e.shiftKey)
		{
			 if (e.keyCode == 13) // Enter
			 {
				 e.preventDefault( );
				 if (!_isEmpty( ))
					 _submit( );
			 }
			 else if (e.keyCode == 27) // Escape
			 {
				  e.preventDefault( );
				  _setContents( "" );
			 }
		}
	}

	var _onFocus = function( e )
	{
		_togglePlaceholder( false );
		_restoreSelection( );
	}

	var _onBlur = function( e )
	{
		_togglePlaceholder( _isEmpty( ) );
		_saveSelection( );
	}

	var _togglePlaceholder = function( toggle )
	{
		_elem.children( ".placeholder" ).toggle( toggle );
	}

	var _submit = function( )
	{
		_floatingTool.apply( );
		var input = _parseInput( );
		_setContents( "" );
		if (input.mode == "whisper" && input.player && input.msg)
			 app.sendWhisper( input.player, input.msg );
		else if (input.mode == "emote" && input.msg)
			app.sendEmote( input.msg );
		else if (input.mode == "raw" && input.msg)
			 app.sendRaw( input.msg );
		else if (input.mode == "speech" && input.msg)
			 app.sendSpeech( input.msg );
		_refresh( );
	}

	var _refresh = function( )
	{
		_toggleEmpty( _isEmpty( ) );
		_setChatMode( _parseInput( ).mode );
		_fit( );
	}

	var _toggleEmpty = function( empty )
	{
		_elem.children( ".send" ).toggleClass( "empty", empty );
	}

	var _fit = function( )
	{
		_fitSendButton( );
		var prevHeight = _elem.height( );
		_elem.css( "height", "" );
		var newHeight = _elem.height( );
		_elem.css( "height", prevHeight + "px" );
		if (prevHeight != newHeight)
		{
			_elem.css( "height", newHeight + "px" );
			_events.raise( newHeight > prevHeight ? "grow" : "shrink",
				_this.getHeight( ) );
		}
	}

	var _fitSendButton = function( )
	{
		// There is no precise way to do this, so relax it.
		var $content = _elem.children( ".text" );
		var $button = _elem.children( ".send" );
		var $spacer = _elem.children( ".spacer" );
		var buttonHeight = $button.outerHeight( );
		var contentTop = $content.offset( ).top;

		var spacerHeight = 0;
		$spacer.css( "height", "0" );
		for (var i = 0; i < 256; ++i)
		{
			var contentBottom = contentTop + $content.height( );
			var buttonBottom = $button.offset( ).top + buttonHeight;
			var dy = contentBottom - buttonBottom;
			if (dy < 4)
				break;
			spacerHeight += 0.25;
			$spacer.css( "height", spacerHeight + "em" );
		}
	}

	var _setChatMode = function( mode )
	{
		var modeImages = {
			"speech": "img/chat-mode-speech.png",
			"whisper": "img/chat-mode-whisper.png",
			"emote": "img/chat-mode-emote.png",
			"raw": "img/chat-mode-raw.png"
		};
		var img = modeImages[mode] || modeImages["speech"];
		_elem.children( ".mode" ).attr( "src", img );
	}

	var _isEmpty = function( )
	{
		return _getContents( ).length == 0;
	}

	var _getContents = function( )
	{
		var contents = _elem.children( ".text" ).html( );
		contents = contents.replace( /^&nbsp;/, "" );
		contents = contents.replace( / &nbsp;/g, "  " );
		contents = contents.replace( /&nbsp;/g, " " );
		if (contents.match( /^\s+$/ ))
			return "";
		return contents;
	}

	this.set = function( text, isMarkup )
	{
		 _setContents( text, isMarkup );
	}

	var _setContents = function( text, isMarkup )
	{
		if (isMarkup)
			_elem.children( ".text" ).html( text );
		else
			_elem.children( ".text" ).text( text );
		_cleanInput( );
		_refresh( );
	}

	var _saveSelection = function( )
	{
		var contentNode = _elem.children( ".text" ).get( 0 );
		if (InputHelper.isSelectionInContainer( contentNode ))
			_lastSelection = InputHelper.getSelectionOffsets( contentNode );
		else
			_lastSelection = null;
	}

	var _restoreSelection = function( )
	{
		var contentNode = _elem.children( ".text" ).get( 0 );
		if (_lastSelection)
			InputHelper.selectOffsets( _lastSelection, contentNode );
	}

	var _parseInput = function ( )
	{
		var text = _getContents( );
		var m;
		if (m = /^\/((\S+)\s+(\S.*))?/.exec( text ))
			return { "mode": "whisper", "player": m[2], "msg": m[3] };
		if (m = /^:(\s*(.+))?/.exec( text ))
			return { "mode": "emote", "msg": m[2] };
		if (m = /^`((.+)?)/.exec( text ))
			return { "mode": "raw", "msg": m[2] };
		return { "mode": "speech", "msg": text };
	}

	var _cleanInput = function( )
	{
		var contentNode = _elem.children( ".text" ).get( 0 );
		var sel = InputHelper.getSelectionOffsets( contentNode );
		(function( parent ) {
			while (true)
			{
				var cleanCount = _cleanChildNodes( parent );
				if (!cleanCount)
					break;
			}
			_.each( parent.childNodes, arguments.callee );
		})( contentNode );
		InputHelper.selectOffsets( sel, contentNode );
		contentNode.normalize( );
		if (contentNode.childNodes.length == 0)
			$(contentNode).text( "\xA0" );
	}

	var _cleanChildNodes = function( node )
	{
		var count = 0;
		_.each( _.toArray( node.childNodes ),
			function( child ) {
				if (child.nodeType == Node.ELEMENT_NODE)
				{
					switch (child.tagName)
					{
						case "A":
						case "B":
						case "I":
						case "U":
						case "IMG":
							child.removeAttribute( "style" );
							child.removeAttribute( "title" );
							break;
						default:
							++count;
							if (child.childNodes.length > 0)
								$(child).contents( ).unwrap( );
							else
								$(child).remove( );
					}
				}
				else if (child.nodeType == Node.TEXT_NODE)
				{
					var content = "" + child.nodeValue;
					// Convert sequences of spaces to &nbsp;
					child.nodeValue = content
						.replace( /  /g, " \xA0" )
						.replace( / $/gm, "\xA0" );
				}
			} );
		return count;
	}

	var _onSubmitClicked = function( e )
	{
		e.preventDefault( );
		if (!_isEmpty( ))
			_submit( );
	}

	var _onClick = function( e )
	{
		e.preventDefault( );
		var content = $(this).children( ".text" )
		if (e.target.isSameNode( _elem.get( 0 ) ) && !content.is(":focus"))
		{
			var contentLength = InputHelper.getContainerLength( content.get( 0 ) );
			_lastSelection = {
				"start": contentLength,
				"end": contentLength
			};
			content.focus( );
		}
	}

	this.getHeight = function( )
	{
		return _elem.outerHeight( );
	}

	var _cycleChatMode = function( )
	{
		var input = _parseInput( );
		var order = ["speech","emote","whisper","raw"];
		var mode = order[(_.indexOf( order, input.mode ) + 1) % order.length];
		var contents = _getContents( );
		if (input.mode != "speech")
		{
			// Consume the first letter.
			contents = contents.substr( 1 );
		}
		if (mode != "speech")
		{
			// Add a prefix.
			var prefixMap = {
					"emote": ":",
					"whisper": "/",
					"raw": "`"
				};
			contents = prefixMap[mode] + contents;
		}
		_setContents( contents, true );
	}

	container.append( _elem );
	_elem.children( ".text" )
		.on( "keyup", _onKeyUp )
		.on( "keydown", _onKeyUp )
		.on( "input", _onInput )
		.on( "focus", _onFocus )
		.on( "blur", _onBlur );
	_elem.on( "click", _onClick );
	_elem.children( ".send" ).on( "click", _onSubmitClicked );
	_elem.children( ".mode" ).on( "click", _cycleChatMode );
	$(window).on( "resize", _fit );
	_cleanInput( );
	_refresh( );
};
