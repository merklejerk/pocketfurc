requirejs.config( {
	paths: {
		"underscore": "/lib/underscore",
		"jquery.all": "/lib/jquery.all",
		"jquery": "/lib/jquery",
		"jquery.autosize": "/lib/jquery.autosize",
		"handlebars.runtime": "/lib/handlebars.runtime",
		"html": "/lib/html",
		"text": "/lib/text"
	},
	shim: {
		"jquery": {
			exports: "$"
		},
		"underscore": {
			exports: "_"
		},
		"jquery.autosize": {
			deps: ["jquery"]
		}
	}
} );
