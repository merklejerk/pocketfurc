var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );

module.exports = function( parent, child, clear, onClickOut )
{
	var _this = this;
	var _elem = $("<div class=modal-cover />");

	var _init = function( )
	{
		_fit( );
		$(window).on( "resize", _onResize );

		_elem.toggleClass( "clear", !!clear );
		_elem.on( "click", _onClick );
		_elem.append( child );
		parent.append( _elem );
	}

	this.destroy = function( )
	{
		child.detach( );
		_elem.remove( );
		$(window).off( "resize", _onResize );
	}

	var _onClick = function( )
	{
		if (onClickOut)
			onClickOut( );
	}

	var _onResize = function( )
	{
		_fit( );
	}

	var _fit = function( )
	{
		var bounds = parent.offset( );
		bounds.width = parent.width( );
		bounds.height = parent.height( );
		_elem.css( bounds );
	}

	_init( );
}
