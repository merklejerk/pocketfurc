define( ["underscore","jquery.all", "jsfurc/jsfurc", "ModalCover"],
	function( _, $, jsfurc, ModalCover ) {

return function( sections )
{
	var _this = this;
	var _elem = $("<div class='popup-menu' />" );
	var _events = new jsfurc.Eventful( this );
	var _items = {};
	var _modal;

	var _init = function( )
	{
		_.each( sections,
			function( section ) {
				_createSection( section );
			} );
	}

	var _createSection = function( section )
	{
		var e = $("<div class='section' />");
		_elem.append( e );
		_.each( section,
			function( item ) {
				_createItem( e, item );
			} );
	}

	var _createItem = function( section, item )
	{
		var e = $("<div class='item'><span class='check' /><span class='label' /></div>");
		item = _items[item.id] = {
			"label": item.label,
			"id": item.id,
			"checked": !!item.checked,
			"elem": e,
			"disabled": !!item.disabled,
			"centered": !!item.centered
		};
		e.children( ".label" ).text( item.label );
		e.children( ".check" ).toggle( item.checked );
		e.toggleClass( "disabled", item.disabled )
			.toggleClass( "centered", item.centered );
		e.on( "click", _.partial( _onItemClicked, item ) );
		section.append( e );
	}

	var _onItemClicked = function( item, e )
	{
		e.preventDefault( );
		if (!item.disabled)
		{
			_events.raise( "pick", item.id, item.checked );
			_this.hide( );
		}
	}

	this.toggleItemChecked = function( id, checked )
	{
		if (id in _items)
		{
			_items[id].checked = checked;
			_items[id].elem.children( ".check" ).toggle( checked );
		}
	}

	this.isItemChecked = function( id )
	{
		return id in _items && _items[id].checked;
	}

	this.toggleItemEnabled = function( id, enabled )
	{
		if (id in _items)
		{
			_items[id].disabled = !enabled;
			_items[id].elem.toggleClass( "disabled", !enabled );
		}
	}

	this.isItemEnabled = function( id )
	{
		return id in _items && !_items[id].disabled;
	}

	this.show = function( x, y )
	{
		if (!_modal)
		{
			_modal = new ModalCover( $("body"), _elem, true, _onClickOut );
			_reposition( x, y );
		}
	}

	var _reposition = function( x, y )
	{
		_elem.css( "left", x, "top", y );
		var w = _elem.outerWidth( true );
		var h = _elem.outerHeight( true );
		var win = $(window);
		var ww = win.width( );
		var wh = win.height( );
		var wx = win.scrollLeft( );
		var wy = win.scrollTop( );
		x = Math.min( wx + (ww-w), Math.max( x, wx ) );
		y = Math.min( wy + (wh-h), Math.max( y, wy ) );
		_elem.css( {"left": x, "top": y} );
	}

	var _onClickOut = function( )
	{
		_this.hide( );
	}

	this.hide = function( )
	{
		if (_modal)
		{
			_modal.destroy( );
			_modal = null;
		}
	}

	this.isOpen = function( )
	{
		return !!_modal;
	}

	_init( );
}

} );
