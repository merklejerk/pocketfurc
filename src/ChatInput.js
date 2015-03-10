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
   var $root = $(templates["chat-input"]( ));
   var $content = $root.children( ".text ");
   var _events = new Eventful( this );
   var _floatingTool = new ChatInputFloatingTool( $content );
   var _lastSelection = null;

   this.getApp = function( )
   {
       return app;
   }

   this.focus = function( )
   {
      $root.children( ".text" ).focus( );
      _restoreSelection( );
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
   }

   var _onBlur = function( e )
   {
      _togglePlaceholder( _isEmpty( ) );
      _saveSelection( );
   }

   var _togglePlaceholder = function( toggle )
   {
      $root.children( ".placeholder" ).toggle( toggle );
   }

   var _submit = function( )
   {
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
      var empty = _isEmpty( );
      _toggleEmpty( empty );
      _togglePlaceholder( empty && !$content.is( ":focus" ) );
      _setChatMode( _parseInputMode( ) );
      _fit( );
   }

   var _parseInputMode = function( )
   {
      var firstChild = $content.get( 0 ).firstChild;
      if (!firstChild || firstChild.nodeType != Node.TEXT_NODE
          || firstChild.length == 0)
         return "speech";
      switch (firstChild.nodeValue.charAt( 0 ))
      {
         case "/":
            return "whisper";
         case ":":
            return "emote";
         case "`":
            return "raw";
      }
      return "speech";
   }

   var _toggleEmpty = function( empty )
   {
      $root.children( ".send" ).toggleClass( "empty", empty );
   }

   var _fit = function( )
   {
      _fitSendButton( );
      var prevHeight = $root.height( );
      $root.css( "height", "" );
      var newHeight = $root.height( );
      $root.css( "height", prevHeight + "px" );
      if (prevHeight != newHeight)
      {
         $root.css( "height", newHeight + "px" );
         _events.raise( newHeight > prevHeight ? "grow" : "shrink",
            _this.getHeight( ) );
      }
   }

   var _fitSendButton = function( )
   {
      var $button = $root.children( ".send" );
      var $spacer = $root.children( ".spacer" );
      var buttonHeight = $button.outerHeight( );
      var contentTop = $content.offset( ).top;

      $spacer.css( "height", "1em" );
      var spacerHeightBasis = $spacer.height( );
      $spacer.css( "height", "0" );
      var contentBottom = contentTop + $content.height( );
      var buttonBottom = $button.offset( ).top + buttonHeight;
      var dy = contentBottom - buttonBottom;
      var spacerHeight = dy / spacerHeightBasis;
      $spacer.css( "height", spacerHeight + "em" );
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
      $root.children( ".mode" ).attr( "src", img );
   }

   var _isEmpty = function( )
   {
      var contentNode = $content.get( 0 );
      if (contentNode.childNodes.length == 0)
         return true;
      return !!$content.text( ).match( /^\s*$/ );
   }

   var _getContents = function( )
   {
      var $fragment = $("<div></div>").html( $root.children( ".text" ).html( ) );
      return InputHelper.prepareContent( $fragment.get( 0 ) ).innerHTML;
   }

   this.set = function( text, isMarkup )
   {
       _setContents( text, isMarkup );
      _placeCaretAtEnd( );
   }

   var _setContents = function( text, isMarkup )
   {
      if (isMarkup)
         $content.html( text );
      else
         $content.text( text );
      _cleanInput( );
      _refresh( );
   }

   var _saveSelection = function( )
   {
      var contentNode = $content.get( 0 );
      if (InputHelper.isSelectionInContainer( contentNode ))
         _lastSelection = InputHelper.getSelectionOffsets( contentNode );
      else
         _lastSelection = null;
   }

   var _restoreSelection = function( )
   {
      var contentNode = $content.get( 0 );
      if (_lastSelection)
         InputHelper.selectOffsets( _lastSelection, contentNode );
   }

   var _parseInput = function ( )
   {
      var html = _getContents( );
      var m;
      if (m = /^\/((\S+)\s+(\S.*))?/.exec( html ))
         return { "mode": "whisper", "player": m[2], "msg": m[3] };
      if (m = /^:(\s*(.+))?/.exec( html ))
         return { "mode": "emote", "msg": m[2] };
      if (m = /^`((.+)?)/.exec( html ))
         return { "mode": "raw", "msg": m[2] };
      return { "mode": "speech", "msg": html };
   }

   var _onInput = function( e )
   {
      _cleanInput( );
      _refresh( );
   }

   var _cleanInput = function( )
   {
      // Stick a <br> in there so the cursor appears
      // in the right place when empty.
      if (_isEmpty( ))
         $content.html( "<br />" );
   }

   var _onSubmitClicked = function( e )
   {
      e.preventDefault( );
      if (!_isEmpty( ))
      {
         _submit( );
         _this.focus( );
      }
   }

   this.getHeight = function( )
   {
      return $root.outerHeight( );
   }

   var _cycleChatMode = function( )
   {
      var mode = _parseInputMode( );
      var order = ["speech","emote","whisper","raw"];
      var nextMode = order[(_.indexOf( order, mode ) + 1) % order.length];
      var html = $content.html( );
      if (mode != "speech")
      {
         html = html.substr( 1 );
      }
      if (nextMode != "speech")
      {
         // Add a prefix.
         var prefixMap = {
               "emote": ":",
               "whisper": "/",
               "raw": "`"
            };
         html = prefixMap[nextMode] + html;
      }
      _setContents( html, true );
      _placeCaretAtEnd( );
   }

   var _placeCaretAtEnd = function( )
   {
      $content.focus( );
      var len = InputHelper.getContainerLength( $content.get( 0 ) );
      InputHelper.selectOffsets( { "start": len, "end": len }, $content.get( 0 ) );
      _saveSelection( );
   }

   var _onPaste = function( )
   {
		var contentNode = $content.get( 0 );
		// Pasted contents won't actually be there until
		// input event fires.
		$content.on( "input", function( ) {
			var selOffset = InputHelper.getSelectionOffsets( contentNode ).end
				- InputHelper.getContainerLength( contentNode );
			$content.off( "input", arguments.callee );
			InputHelper.sanitize( contentNode );
			selOffset = InputHelper.getContainerLength( contentNode ) + selOffset;
			InputHelper.selectOffsets( {"start": selOffset, "end": selOffset }, contentNode );
		} );
   }

   container.append( $root );
   $root.children( ".text" )
      .on( "keyup", _onKeyUp )
      .on( "keydown", _onKeyUp )
      .on( "input", _onInput )
      .on( "focus", _onFocus )
      .on( "blur", _onBlur )
      .on( "paste", _onPaste );
   $root.children( ".send" ).on( "click", _onSubmitClicked );
   $root.children( ".mode" ).on( "click", function( e ) {
      e.preventDefault( );
      _cycleChatMode( );
   } );
   $(window).on( "resize", _fit );
   _cleanInput( );
   _refresh( );
};
