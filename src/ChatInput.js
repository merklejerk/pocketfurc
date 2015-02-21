var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var Eventful = require( "./jsfurc/Eventful" );
var ModalCover = require( "./ModalCover" );
var ChatInputFloatingTool = require( "./ChatInputFloatingTool" );

module.exports = function( container, app )
{
   var _this = this;
   var _elem = $(templates["chat-input"]( ));
   var _events = new Eventful( this );
   var _floatingTool = new ChatInputFloatingTool( _elem.children( ".text" ) );

   this.getApp = function( )
   {
       return app;
   }

   this.focus = function( )
   {
      _elem.children( ".text" ).focus( );
      _placeCaretAtEnd( );
   }

   var _onInput = function( e )
   {
      _cleanInput( );
      _refresh( );
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
   }

   var _togglePlaceholder = function( toggle )
   {
      _elem.children( ".placeholder" ).toggle( toggle );
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
      contents = contents.replace( / \xAO/g, " " );
      contents = contents.replace( /\xA0/g, "" );
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
      // Convert sequences of spaces to &nbsp;
      text = text.replace( /  /g, " \xA0" );
      text = text.replace( / $/gm, "\xA0" );
      if (isMarkup)
         _elem.children( ".text" ).html( text );
      else
         _elem.children( ".text" ).text( text );
      _cleanInput( );
      _placeCaretAtEnd( );
      _refresh( );
   }

   var _placeCaretAtEnd = function( )
   {
      var selection = window.getSelection( );
      var range = document.createRange( );
      range.selectNodeContents( _elem.children( ".text" ).get( 0 ) );
      range.collapse( );
      selection.removeAllRanges( );
      selection.addRange( range );
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
      var selectionRange = _saveSelection( textNode );
      var textNode = _elem.children( ".text" ).get( 0 );
      (function( parent ) {
         while (true)
         {
            var cleanCount = _cleanChildNodes( parent );
            if (!cleanCount)
               break;
         }
         _.each( parent.childNodes, arguments.callee );
      })( textNode );
      _restoreSelection( selectionRange );
      textNode.normalize( );
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
                     $(child).before( $(child).contents( ) ).remove( );
               }
            }
         } );
      return count;
   }

   var _saveSelection = function( )
   {
      var selection = window.getSelection( );
      if (selection.rangeCount > 0)
      {
         var range = selection.getRangeAt( 0 );
         return range.cloneRange( );
      }
   }

   var _restoreSelection = function( range )
   {
      if (range)
      {
         var selection = window.getSelection( );
         selection.removeAllRanges( );
         selection.addRange( range );
      }
   }
   var _onSubmitClicked = function( e )
   {
      e.preventDefault( );
      if (!_isEmpty( ))
         _submit( );
   }

   var _onClick = function( e )
   {
      var text = $(this).children( ".text" )
      if (e.target == _elem.get( 0 ) && !text.is(":focus"))
      {
         text.focus( );
         var sel = window.getSelection( );
         sel.collapse( sel.focusNode, sel.focusNode.length );
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

   var _onContextMenu = function( )
   {
      var pos = _getCaretPosition( );
      var popup = new ChatInputContextMenu( pos.x, pos.y );
      popup.on( "bold", _onBold );
      popup.on( "italic", _onItalic );
      popup.on( "underline", _onUnderline );
      popup.on( "link", _onLink );
   }

   container.append( _elem );
   _elem.children( ".text" )
      .on( "keyup", _onKeyUp )
      .on( "input", _onInput )
      .on( "focus", _onFocus )
      .on( "blur", _onBlur );
   _elem.on( "click", _onClick );
   _elem.children( ".send" ).on( "click", _onSubmitClicked );
   _elem.children( ".mode" ).on( "click", _cycleChatMode );
   _refresh( );
};
