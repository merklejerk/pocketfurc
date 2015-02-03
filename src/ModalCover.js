define( ["underscore", "jquery.all", "util"],
	function( _, $, util ) {

return function( parent, child, clear, onClickOut )
{
	var _this = this;
	var _elem = $("<div class=modal-cover />");

	this.destroy = function( )
	{
		child.detach( );
		_elem.remove( );
	}

	var _onClick = function( )
	{
		if (onClickOut)
			onClickOut( );
	}

	_elem.toggleClass( "clear", !!clear );
	_elem.on( "click", _onClick );
	_elem.append( child );
	parent.append( _elem );
}

} );
