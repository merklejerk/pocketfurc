var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var Eventful = require( "./jsfurc/Eventful" );

module.exports = function( container ) {

	var _this = this;
	var _pinned = true;
	var _elem = $(templates["chat-buffer"]( ));
	var _bufferElem = _elem.find( ".buffer" );
	var _events = new Eventful( this );
	var _maxLines = 312;

	var _init = function( )
	{
		container.append( _elem );
		_bufferElem.on( "scroll", _onScroll );
		_elem.find( "> .alert-area > .new-line-alert" )
			.on( "click", _onNewLineAlertClicked );
	}

	var _onNewLineAlertClicked = function( e )
	{
		e.preventDefault( );
		_toggleNewLineAlert( false );
		_pinned = true;
		_autoScroll( );
	}

	var _onScroll = function( e )
	{
		_updatePinned( );
	}

	var _updatePinned = function( )
	{
		var h = _bufferElem.get(0).scrollHeight;
		_pinned = _bufferElem.height( ) + _bufferElem.scrollTop( ) >= h;
		if (_pinned)
			_toggleNewLineAlert( false );
	}

	this.toggle = function( visible )
	{
		_elem.toggle( visible );
	}

	var _toggleNewLineAlert = function( toggled )
	{
		_icon = _elem.find( "> .alert-area > .new-line-alert" );
		var iconVisible = _icon.css( "display" ) != "none";
		if (!toggled && iconVisible)
			_icon.hide( );
		else if (toggled && !iconVisible)
			_icon.show( );
	}

	this.isPinned = function( )
	{
		return _pinned;
	}

	this.appendLine = function( body, withTimestamp )
	{
		var line = $(templates["chat-buffer-line"](
			{
				"timestamp": withTimestamp ? util.createTimestamp( ) : ""
			} ));
		line.children( ".body" ).append( body );
		if (!withTimestamp)
			line.children( ".timestamp" ).remove( );
		_bufferElem.append( line );
		_this.contentsChanged( );
	}

	this.contentsChanged = function( )
	{
		_cullLines( );
		_autoScroll( );
		if (!_pinned)
			_toggleNewLineAlert( true );
	}

	this.getLines = function( )
	{
		return _bufferElem.find( "> .line > .body > *" );
	}

	var _cullLines = function( )
	{
		var oldHeight = _bufferElem.get( 0 ).scrollHeight;
		var lines = _bufferElem.find( "> .line").toArray( );
		if (lines.length > _maxLines)
		{
			var culledLines = lines.slice( 0, lines.length - _maxLines );
			_.each( culledLines,
				function( line ) {
					_events.raise( "line-culled", $(line).detach( ) );
				} );
		}
		// Make sure the scroll doesn't jump.
		var newHeight = _bufferElem.get( 0 ).scrollHeight;
		if (!_pinned)
			_bufferElem.scrollTop( _bufferElem.scrollTop( ) - (oldHeight-newHeight) );
		else
			_bufferElem.scrollTop( newHeight );
	}

	this.setLineLimit = function( numLines )
	{
		_maxLines = numLines;
	}

	this.resize = function( height )
	{
		var padding = _elem.outerHeight( ) - _elem.height( );
		_elem.css( "height", Math.max( 0, height - padding ) + "px" );
		_autoScroll( );
	}

	var _autoScroll = function( )
	{
		if (_pinned)
			_bufferElem.scrollTop( _bufferElem.get(0).scrollHeight );
	}

	_init( );
};
