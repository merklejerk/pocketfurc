define( ["jquery.all","underscore","util","templates.compiled.js"],
	function( $, _, util, templates ) {

return function( container ) {

	var _this = this;
	var _pinned = true;
	var _elem = $("<div class='chat-buffer' />");
	var _newLineAlertElem = $("<div class='new-line-alert' />");

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
		_this.contentsChanged( );
	}

	var _contentAdded = function( )
	{
		if (_pinned)
			_elem.scrollTop( _elem.get(0).scrollHeight );
		else
			_toggleNewLineAlert( true );
	}

	var _toggleNewLineAlert = function( toggled )
	{
		var elemVisible = _newLineAlertElem.is( ":visible" );
		if (!toggled && elemVisible)
			_newLineAlertElem.hide( );
		else if (toggled && !elemVisible)
			_newLineAlertElem.show( );
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
		_elem.append( line );
		_contentAdded( );
	}

	container.append( _elem );
	_elem.on( "scroll", _onScroll );
};

} );
