define( ["jquery.all","underscore","util","jsfurc/Eventful"],
	function( $, _, util, Eventful ) {

return function( container )
{
	var _this = this;
	var _elem = $("<textarea class='chat-input' />");
	var _events = new Eventful( this );

	var _onKeyUp = function( e )
	{
		if (e.keyCode == 13 && !e.shiftKey && !e.shiftKey)
		{
			var val = _elem.val( );
			if (val.length > 1)
			{
				_elem.val( "" ).trigger( "autosize.resize" );
				_events.raise( "submit", val.substr( 0, val.length - 1 ) );
			}
		}
	}

	_elem.autosize( );
	_elem.on( "keyup", _onKeyUp );
	container.append( _elem );
};

} );
