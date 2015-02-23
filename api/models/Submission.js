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

	beforeCreate: function (values, cb) {
		//values.message = false;
		Problem.findOne(values.problem).exec(function (err, p) {
			if (err) {
				console.log("There was an error loading the associated problem");
				return cb();
			}
			var onSubmit = new Function("batch", "code", "style", "solution", "fail", "pass", "status", p.onSubmit);
			try {
				var updatePoints = function () {
					values.value = {
						correct: score.f ? p.value.correct : 0,
						style:   score.s ? p.value.style : 0
					};
					cb(null, values);
					done.updated = true;
				};
				var done = {
					f: false,
					s: false,
					updated: false
				};
				var score = {
					f: false,
					s: false
				};
				onSubmit(
					require("../../batch/batch"),	// "batch" - the batch module
					values.code,					// "code" - the student's code
					values.style,					// "style" - the style analysis of the student's code
					p.solution,						// "solution" - the values stored in the solution in the problem
					{ 								// "fail" - the code behind fail.f() and fail.s()
						f: function (msg) {
							if (!done.f) {
								score.f = false;
							}
							values.message = values.message || msg;
							if (done.s && !done.updated) {
								updatePoints();
							}
							done.f = true;
						},
						s: function (msg) {
							if (!done.s) {
								score.s = false;
							}
							values.message = values.message || msg;
							if (done.f && !done.updated) {
								updatePoints();
							}
							done.s = true;
						}
					},
					{ 								// "pass" - the code behind pass.f() and pass.s()
						f: function () {
							if (!done.f) {
								score.f = true;
							}
							if (done.s && !done.updated) {
								updatePoints();
							}
							done.f = true;
						},
						s: function () {
							if (!done.s) {
								score.s = true;
							}
							if (done.f && !done.updated) {
								updatePoints();
							}
							done.s = true;
						}
					},
					{ 								// "status" - useful methods for knowing the status of grading
						f: function() {
							return {
								called: done.f,
								result: score.f
							}
						},
						s: function() {
							return {
								called: done.s,
								result: score.s
							}
						}
					}
				);
			} catch (e) {
				console.log("Running onSubmit failed: " + e);
				cb(e);
			}
		});
	}

};
