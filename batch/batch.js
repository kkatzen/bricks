
var Sandbox = require("./sandbox.js");

exports.exec = function (code, inputs, solution, cb) {
	if (arguments.length === 1) {
		// TODO -- Run code once with no inputs
		return;
	}
	if (arguments.length === 3) {
		cb = solution;
	}
	var completed = 0;
	var outputs = [];
	var err = {
		msg: []
	};
	function arrayEquals(a,b) {
		if (a === b) return true;
		if (a == null || b == null) return false;
		if (a.length != b.length) return false;
		for (var i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) return false;
		}
		return true
	}
	function done() {
		completed++;
		if (completed == inputs.length) {
			if (typeof solution === "object") {
				// check the inputs against the solution array
				var results = [];
				for (var i in solution) {
					results[i] = arrayEquals(solution[i], outputs[i]);
				}
				cb && cb(null, outputs, results);
			} else {
				cb && cb(null, outputs);
			}
		}
	}
	// run the code against all the inputs
	for (var i in inputs) {
		var s = new Sandbox();
		s.setInput(inputs[i]);
		s.run(i, code, function (id, output) {
			outputs[id] = output;
			done();
		}, function (e) {
			err.msg.push(e.msg);
			completed++;
			if (completed == inputs.length) {
				cb && cb(err, [], []);
			}
		});
	}
};
