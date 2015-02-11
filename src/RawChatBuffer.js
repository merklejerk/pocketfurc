var $ = require( "jquery" );
var _ = require( "underscore" );
var util = require( "./util" );
var templates = require( "./templates" );
var ChatBuffer = require( "./ChatBuffer" );

module.exports = function( container ) {

	var _this = this;
	var _buffer = new ChatBuffer( container );

	this.resized = function( )
	{
		_buffer.resized( );
	}

	this.append = function( msg )
	{
		var body = templates["raw-chat-buffer-line"](
			{
				"message": msg
			} );
		_buffer.appendLine( body, true );
	}

};
