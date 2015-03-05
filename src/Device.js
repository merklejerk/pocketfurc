var _ = require( "underscore" );
var Eventful = require( "./jsfurc/Eventful" );

var ChromeDevice = function( )
{
	var _this = this;
	var _blurred = false;
	var _events = new Eventful( this );

	this.isMobile = function( )
	{
		return false;
	}

	this.isBackground = function( )
	{
		return _blurred;
	}

	this.setBackgroundText = function( )
	{
		// No-op.
	}

	this.allowBackgroundMode = function( toggle )
	{
		// No-op.
	}

	var _onWindowBlur = function( )
	{
		_blurred = true;
		_events.raise( "background" );
	}

	var _onWindowFocus = function( )
	{
		_blurred = false;
		_events.raise( "foreground" );
	}

	this.isReady = function( )
	{
		return true;
	}

	window.onblur = _onWindowBlur;
	window.onfocus = _onWindowFocus;
	_events.raise( "ready" );
}

var CordovaDevice = function( )
{
	var _this = this;
	var _events = new Eventful( this );
	var _platform = "mobile";
	var _plugin = null;
	var _lastBackgroundNotificationText = "Running"

	this.isMobile = function( )
	{
		return true;
	}

	this.isBackground = function( )
	{
		if (_plugin)
			return _plugin.isActive( );
		return false;
	}

	this.allowBackgroundMode = function( toggle )
	{
		if (_plugin)
		{
			if (toggle)
				_plugin.enable( );
			else
				_plugin.disable( );
		}
	}

	this.setBackgroundText = function( text )
	{
		if (_plugin && text != _lastBackgroundNotificationText)
		{
			_lastBackgroundNotificationText = text;
			if (_plugin.isActive( ))
				_plugin.configure( {
					"text": _lastBackgroundNotificationText
				} );
			_plugin.setDefaults( {
				"text": _lastBackgroundNotificationText
			} );
		}
	}

	var _onBackground = function( )
	{
		_events.raise( "background" );
	}

	var _onForeground = function( )
	{
		_events.raise( "foreground" );
	}

	var _onDeviceReady = function( )
	{
		_platform = device.platform;
		_plugin = cordova.plugins.backgroundMode;
		_plugin.onactivate = _onBackground;
		_plugin.ondeactivate = _onForeground;
		_plugin.setDefaults( {
				"title": "PocketFurc",
				"text": _lastBackgroundNotificationText
			}
		 );
		_events.raise( "ready" );
	}

	this.isReady = function( )
	{
		return !!_plugin;
	}

	document.addEventListener( "deviceready", _onDeviceReady, false );
}

var Device = ChromeDevice;
if (typeof( device ) != "undefined")  // Set if on cordova.
	Device = CordovaDevice;
var singleton = new Device( );

module.exports = function( onReady ) {
	_.extend( this, singleton );

	if (onReady)
	{
		if (singleton.isReady( ))
			onReady( );
		else
			singleton.on( "ready", onReady );
	}
};
