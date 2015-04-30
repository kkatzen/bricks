/**
 * ProblemController
 */

module.exports = {
    
  
  /**
   * Action blueprints:
   *    `/assignment/create`
   */
	create: function (req, res) {
        Problem.count({folder: req.param("folder")}).done(function(err, count) {
            var problemDetails = {
                num: Number(count),
                type: req.param("type"),
                phase: Number(req.param("phase")),
                name: req.param("name"),
                folder: req.param("folder"),
                language: req.param("language"),
                text: req.param("text"),
                value: {correct: req.param("correct"), style: req.param("style")},
                onSubmit: req.param("onSubmit")
            };
            Problem.create(problemDetails).done(function(err, problem) {
                if (err) {
                    console.log(err);
                    res.send(500, {error: "DB Error creating new team"});
                } else {
                    res.send(problem);
                }
            });
        });
	},


  /**
   * Action blueprints:
   *    `/assignment/read`
   */
   read: function (req, res) {
        var folder = req.param("folder") || null;
        var ph = Number(req.param("phase")) || 3;
        if (folder) {
            Problem.find({folder: folder,phase: {'<': ph}})
            .sort({"num": 1}) 
            .exec(function(err, problems) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(problems);
                }
            });
        } else {
			var id = req.param("id") || null;
			if (id) {
				Problem.findOne({id:id}).exec(function (err, problem) {
					if (err) {
						res.send(500, {error: "DB error finding problem"});
						return;
					} else {
						res.send(problem);
					}
				});
			} else {
				res.send(500, {error: "Couldn't grab a problem"});
			}
		}
  },


  /**
   * Action blueprints:
   *    `/assignment/update`
   */
   update: function (req, res) {

    var id = req.param("id");
    var name = req.param("name");
    var newIndex = req.param("newIndex");
    var oldIndex = req.param("oldIndex");

    //necessary because of reordering afterwards
    if(parseInt(newIndex) > parseInt(oldIndex)){
      newIndex = parseInt(newIndex) + 1; 
    }

   if(newIndex) {
    console.log("updating Num: new index..." + newIndex +" from "+oldIndex);
    Problem.update({id:id}, {num: newIndex}).exec(function(err2, problem2) {
        if(err2) {
            console.log(err2);
        } else {
            res.send(problem2[0]);
        }
    });

   } else {
       var opts = {
            type: req.param("type"),
            phase: Number(req.param("phase")),
            name: req.param("name"),
            folder: req.param("folder"),
            language: req.param("language"),
            text: req.param("text"),
            value: {correct: req.param("correct"), style: req.param("style")},
            onSubmit: req.param("onSubmit")
        }
        Problem.update({id: id}, opts).exec(function(err, problem) {
            if(err) {
                console.log(err);
                res.send(500, {error: "DB Error updating problem"});
            } else {
                res.send(problem[0]);
            }
        });
      }
   },


  /**
   * Action blueprints:
   *    `/assignment/delete`
   */
   delete: function (req, res) {
    var id = req.param("id");
    Problem.destroy({id: id}).done(function(err, problem){
        if(err){
            console.log(err);
        } else {
        }
    });
    //delete all children submissions
    Submission.find({problem: id}).done(function(err, submissions){
      submissions.forEach( function (submission) {
          Submission.destroy({id: submission.id}).done(function(err, submission){
            if(err){
                console.log(err);
            } else {
            }
          });
      });
    });
  },

  reorder: function (req, res) {
    console.log("reorder" + req.param("folder"));
    Problem.find({folder: req.param("folder")})
    .sort({"num": 1, "updatedAt":-1})
    .exec(function(err, problems) {
        var num = 0;
        problems.forEach(function(problem) {
            problem.num = Number(num);
            problem.save( function (err) {
                if (err) {
                    console.log(err);
                }
            });
            num++;
        });
        res.end();
    });
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AssignmentController)
   */
  _config: {}

  
};
