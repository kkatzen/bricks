
process.on('uncaughtException', function (e) {
	process.send({err:"There was an error",msg:e.toString()});
	//process.send({err:"There was an error",msg:e.stack});
	process.exit(0);
});

var vm = require( 'vm' );

var source = '';
var input = [];
var output = [];

function getSafeRunner() {
	var global = this;
	function UserScript(str) {
		//ret = Function('eval(' + JSON.stringify(str + '') + ')');
		ret = Function('(function() { ' + str  + '\n})()' );
		//send({err: ret.toString()});
		return ret;
	}
	return function run (src) {
		bricksRands = [.1,.2,.3,.4,.6,.7,.8,.9];
		bricksRandsIndex = bricksRands.length - 1;
		global.prompt = function () {
			return input.shift();
		}
		global.alert = function (str) {
			output.push(str);
			//send({dbg:JSON.stringify(output)});
		};
		global.print = function (str) {
		};
		global.console = {};
		global.console.log = function (str) {
		};
		global.Math.random = function () {
			bricksRandsIndex = (bricksRandsIndex + 1) % bricksRands.length;
			return bricksRands[bricksRandsIndex];
		}
		UserScript(src)();
		send({result:JSON.stringify(output)});
	};
}

process.on('message', function (m) {
	if (m.run) {
		if (m.code) {
			source += m.code;
		}
		var context = vm.createContext();
		context.input = input;
		context.output = output;
		context.send = function (obj) {
			process.send(obj);
			process.exit(0);
		};
		var safeRunner = vm.runInContext('(' + getSafeRunner.toString() + ')()', context);
		safeRunner(source);
	} else if (m.code) {
		source += m.code;
	} else if (m.input) {
		input = m.input;
	}
});
