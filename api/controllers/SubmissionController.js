/**
 * SubmissionController
 */

module.exports = {

	create: function (req, res) {
		var submissionDetails = {
			user: req.user.username,
			problem: req.param("problem"),
			code: req.param("code"),
			style: JSON.parse(req.param("style")),
			value: {correct: 2, style: 2}
		};
		Submission.create(submissionDetails).done(function(err, submission) {
			if (err) {
				res.send(500, {error: "DB Error creating new team"});
                console.log(err);
			} else {
                res.send(submission);
			} 
		});
	},


  /**
   * Action blueprints:
   *    `/submission/read`
   */
   read: function (req, res) {
        var problem = req.param("id");
        var highest = req.param("highest");
        var student = req.param("student");
        var reverse = req.param("reverse");
        var direction = 1;
        if(reverse){
          direction = -1;
        }

        if (problem && !student) {
            Submission.find({problem: problem, user: req.user.username}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (problem && student) {
            Submission.find({problem: problem, user: student}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (!problem && student) {
            Submission.find({user: student}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else {
            Submission.find().sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
       }   
  },


  /**
   * Action blueprints:
   *    `/submission/update`
   */
   update: function (req, res) {
    
    // Send a JSON response
    return res.json({
      hello: 'world'
    });
  },


  /**
   * Action blueprints:
   *    `/submission/delete`
   */
   delete: function (req, res) {
    var id = req.param("id");
    Submission.destroy({id: id}).done(function(err, submission){
        if(err){
            console.log(err);
        } else {
        }
    });
    // Send a JSON response
    /*return res.json({
      hello: 'world'
    });*/
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SubbmissionController)
   */
  _config: {}

  
};
