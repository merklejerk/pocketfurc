chrome.app.runtime.onLaunched.addListener( function( ) {
  chrome.app.window.create( "client.html", {
    'bounds': {
      'width': 460,
      'height': 666
    }
  });
});
