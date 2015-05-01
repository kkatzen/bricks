/**
 * Subbmission
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		user: {
			type: 'string',
			notEmpty: true,
			required: true
		},
		problem: {
			type: 'string',
			notEmpty: true,
			required: true
		},
		code: {
			type: 'string',
			notEmpty: true,
			required: true
		},
		style: { // TODO - fill out constraints
			type: 'json'
		},
		value: {
			type: 'json', //correct(functionality points) and style(style points)
			required: true
		},
		message: {
			type: 'string'
		}
	},
// THIS LOOKS LIKE A THING
	beforeCreate: function (values, cb) {
		//values.message = false;
		Problem.findOne(values.problem).exec(function (err, p) {
			if (err) {
				console.log("There was an error loading the associated problem");
				return cb();
			}
			var onSubmit = new Function("batch", "code", "style", "solution", "fail", p.onSubmit);
			try {
				var updatePoints = function () {
					values.value = {
						correct: score.f,  
						style:   score.s
					};
					cb(null, values);
				//	done.updated = true;
				};
				var score = {
					f: p.value.correct,  //begin with full points which users can lose
					s: p.value.style
				};
				onSubmit(
					require("../../batch/batch"),	// "batch" - the batch module
					values.code,					// "code" - the student's code
					values.style,					// "style" - the style analysis of the student's code
					p.solution,						// "solution" - the values stored in the solution in the problem
					{ 								// "fail" - the code behind fail.f() and fail.s()
						f: function (msg,pts) {
							//subtract function points
							score.f = score.f - pts;
							if(score.f < 0){
								score.f = 0;
							}
							//append function message if given 
							if(msg != ""){
								if(!values.message){
									values.message = "Functional Error: " + msg;
								}else {
									values.message = values.message + "\n" + "Functional Error: " + msg;
								}
							}
						},
						s: function (msg,pts) {
							//subtract style points
							score.s = score.s - pts;
							if(score.s < 0){
								score.s = 0;
							}
							//append style message if given
							if(msg != ""){
								if(!values.message){
									values.message = "Style Error: " + msg;
								}else {
									values.message = values.message + "\n " + "Style Error: " + msg;
								}
							}
						},
						done: function (msg,pts) {
							if(!values.message){
								values.message = msg;
								console.log(values.message);
							}
							updatePoints();
						},
					}
				);
			} catch (e) {
				console.log("Running onSubmit failed: " + e);
				cb(e);
			}
		});
	}

};
