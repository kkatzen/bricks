/**
 * FolderController
 */

module.exports = {
    
  
  /**
   * Action blueprints:
   *    `/folder/create`
   */
   create: function (req, res) {
    Folder.count().done(function(err, numb) {
        var folderDetails = {
            name: req.param("name"),
            num: numb
        };
        Folder.create(folderDetails).done(function(err, folder) {
            if(err) {
                console.log(err);
                res.send(500, {error: "DB Error creating new folder"});
            } else {
                res.send(folder);
            }
        });
    });
  },

  /**
   * Action blueprints:
   *    `/folder/read`
   */
   read: function (req, res) {
      var id = req.param("id") || null;
      if (id) {
        Folder.findOne({id:id}).exec(function (err, folder) {
          if (err) {
            res.send(500, {error: "DB error finding folder"});
            return;
          } else {
            res.send(folder);
          }
        });
      }else {    
        Folder.find()
        .sort({"num": 1})
        .exec(function(err, folders) {
              res.send(
                  folders
              );
        });
      }
  },

  
  /**
   * Action blueprints:
   *    `/folder/update`
   */
   update: function (req, res) {
        //need to call reorder after this function so it behaves well.

        var id = req.param("id");
        var name = req.param("name");
        var newIndex = req.param("newIndex");
        var oldIndex = req.param("oldIndex");

        //necessary because of reordering afterwards
        if(parseInt(newIndex) > parseInt(oldIndex)){
          newIndex = parseInt(newIndex) +1; 
        }

        console.log("hi newIndex" + newIndex + "oldIndex" + oldIndex);
        //update num
        if(newIndex){
          console.log("updating Num: new index..." + newIndex)
            Folder.update({id:id}, {num: newIndex}).exec(function(err2, folder2) {
                if(err2) {
                    console.log(err2);
                } else {
                    res.send(folder2[0]);
                }
            });
        //update name
        } else {
            Folder.update({id:id}, {name: name}).exec(function(err, folder) { 
                if(err) {
                    res.send(500, {error: "DB Error updating folder"});
                } else {
                    res.send(folder[0]);
                }
            });
        }
  },


  /**
   * Action blueprints:
   *    `/folder/destroy`
   */
	delete: function (req, res) {
		var id = req.param("id");
		Folder.destroy({id: id}).done(function(err){
			if(err){
				console.log(err);
			} else {
			}
		});
    //delete all children problems
    Problem.find({folder: id}).done(function(err, problems){
        problems.forEach( function (problem) {
            Problem.destroy({id: problem.id}).done(function(err, problem){
              if(err){
                  console.log(err);
              } else {
              }
            });
            //delete all children submissions
            Submission.find({problem: problem.id}).done(function(err, submissions){
              submissions.forEach( function (submission) {
                  Submission.destroy({id: submission.id}).done(function(err, submission){
                    if(err){
                        console.log(err);
                    } else {
                    }
                  });
                });
            });
        });
    });
    res.end();

	},

   reorder: function (req, res) {
      Folder.find()
      .sort({"num": 1, "updatedAt":-1})
      .exec(function(err, folders) {
        var num = 0;
        folders.forEach(function(folder) {
            console.log("folder: " + folder.name);

            console.log("old: " + folder.num);
            folder.num = Number(num);
            console.log("new: " + folder.num);

            folder.save( function(err) {
                if(err) {
                    console.log(err);
                }
            });
            num++;
        });
      });
    res.end();
  },



  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to FolderController)
   */
  _config: {}

  
};
