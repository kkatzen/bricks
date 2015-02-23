

var cp = require('child_process');
var path = require('path');

function Sandbox (options) {
	this.options = options || {
		timeout: 5000
	};

	var timer = null;
	var cb = null;
	var i = null;
	var eb = null;
	var child = cp.fork(path.join(__dirname,'shovel.js'));

	child.on('message', function (m) {
		if (m.dbg) {
			console.log(m.dbg);
			return;
		}
		if (m.err) {
			eb && eb(m);
			return;
		}
		var output = null;
		if (m.result) {
			output = m.result;
		}
		cb && cb(i, JSON.parse(output));
	});
	child.on('close', function (code) {
		if (code != 0) {
			console.log("child finished: " + code);
		}
		if (timer) clearTimeout(timer);
	});
	child.on('error', function (err) {
		console.log("There was an error");
		//console.log(err);
		if (timer) clearTimeout(timer);
	});

	this.code = function (code) {
		child.send({code:code});
		//console.log(child);
	};

	this.setInput = function (input) {
		child.send({input:input});
	};

	this.run = function (id, code, callback, errback) {
		child.send({run: true, code: code});
		cb = callback;
		eb = errback;
		i = id;
		timer = setTimeout( function() {
			output = ["Timeout Error"];
			cb && cb(id, output);
			child.kill( 'SIGKILL' );
		}, this.options.timeout);
	};
}

module.exports = Sandbox;
