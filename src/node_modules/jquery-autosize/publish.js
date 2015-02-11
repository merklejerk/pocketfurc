var exec = require('child_process').exec;
var pkg = require('./package.json');

function tag() {
	exec('git tag '+pkg.version, function(error, stdout, stderr){
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log(stdout);
			push();
		}
	});
}

function push() {
	exec('git push', function(error, stdout, stderr){
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log(stdout);
			publish();
		}
	});
}

function publish() {
	exec('npm publish', function(error, stdout, stderr){
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}

tag();