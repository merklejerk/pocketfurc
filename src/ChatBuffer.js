define( ["jquery.all","underscore","util","templates.compiled", "jsfurc/jsfurc"],
	function( $, _, util, templates, jsfurc ) {

return function( container ) {

	var _this = this;
	var _pinned = true;
	var _elem = $(templates["chat-buffer"]( ));
	var _events = new jsfurc.Eventful( );
	var _maxLines = 312;

	var _onScroll = function( e )
	{
		var h = _elem.get(0).scrollHeight;
		_pinned = _elem.height( ) + _elem.scrollTop( ) >= h;
		if (pinned)
			_toggleNewLineAlert( false );
	}

	this.toggle = function( visible )
	{
		_elem.toggle( visible );
	}

	this.resized = function( )
	{
		_contentAdded( );
	}

	var _contentAdded = function( )
	{
		_cullLines( );
		if (_pinned)
			_elem.scrollTop( _elem.get(0).scrollHeight );
		else
			_toggleNewLineAlert( true );
	}

	var _toggleNewLineAlert = function( toggled )
	{
		_icon = _elem.find( "new-chat-alert" );
		var iconVisible = _elem.is( ":visible" );
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
				"timestamp": withTimestamp ? util.createTimestamp( ) : "",
				"body": body
			} ));
		if (!withTimestamp)
			line.children( "timestamp" ).remove( );
		_elem.children( ".buffer" ).append( line );
		_contentAdded( );
	}

	this.contentsChanged = function( )
	{
		_contentAdded( );
	}

	this.getLines = function( )
	{
		return _elem.find( "> .buffer > .line > .body > *" );
	}

	var _cullLines = function( )
	{
		var lines = _elem.find( "> .buffer > .line").toArray( );
		if (lines.length > _maxLines)
		{
			var culledLines = lines.slice( _maxLines );
			_.each( culledLines,
				function( line ) {
					_events.raise( "line-culled", $(line).detach( ) );
				} );
		}
	}

	this.setLineLimit = function( numLines )
	{
		_maxLines = numLines;
	}

	container.append( _elem );
	_elem.on( "scroll", _onScroll );
};

} );
