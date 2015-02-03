define( ["jquery.all","underscore","util","templates.compiled",
	"ChatBuffer"],
	function( $, _, util, templates ) {

return function( container ) {

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
		_buffer.appendLine( body );
	}
	
};

} );
