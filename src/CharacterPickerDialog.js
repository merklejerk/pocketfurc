var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var ModalCover = require( "./ModalCover" );
var Eventful = require( "./jsfurc/Eventful" );
var Constants = require( "./jsfurc/Constants" );

module.exports = function( )
{
	var _this = this;
	var _modal;
	var _elem = $(templates["character-picker-dialog"]( ));
	var _open = false;
	var _onPick;
  var _onCancel;

	this.show = function( accountInfo, parent, onPick, onCancel )
	{
    _onPick = onPick || _.noop;
    _onCancel = onCancel || _.noop;
    _this.clear( );
    _populate( accountInfo );
		_open = true;
		_modal = new ModalCover( parent, _elem );
		_elem.hide( );
		_.defer( function( ) {
				_elem.show( );
				_elem.addClass( "expanded" );
			} );
	}

  _populate = function( accountInfo )
  {
    var sortedCharacters = _sortCharactersByLastLogin( accountInfo.characters );
    var charsNode = _elem.find( "> .contents .characters" );
    _.each( _sortCharactersByLastLogin( accountInfo.characters ),
      function( character, i )
      {
        var entry = $('<div class="entry">').text( character.name );
        entry.on( "click",
          function( e ) {
            e.preventDefault( );
            $(this).off( "click", arguments.callee );
            _onCharacterClicked( entry, character.id );
          } );
        charsNode.append( entry );
      } );
  }

  _onCharacterClicked = function( entry, characterId )
  {
    entry.addClass( "picked" );
    _.delay( function( ) {
      _this.close( );
      _onPick( characterId );
    }, 500 );
  }

  _sortCharactersByLastLogin = function( characters )
  {
    return _.values( characters ).sort( function( a, b ) {
      if (a.lastLogin > b.lastLogin)
        return -1;
      return 1;
    } );
  }

	this.isOpen = function( )
	{
		return _open;
	}

	this.close = function( )
	{
		_elem.removeClass( "expanded" );
		_modal.destroy( );
		_modal = null;
		_open = false;
	}

	this.clear = function( )
	{
		_elem.find( "> .contents .characters" ).empty( );
	}

	var _onCancelClicked = function( e )
	{
		e.preventDefault( );
    _this.close( );
		_onCancel( );
	}

	this.fit = function( )
	{
		if (_modal)
			_modal.fit( );
	}

  _elem.find( "> .contents .cancel-button" )
    .on( "click", _onCancelClicked );
};
