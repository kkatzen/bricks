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
        var id = req.param("id");
        var name = req.param("name");
        var num = req.param("num");
        var dir = req.param("dir");
        var clicked = Number(num)-Number(dir);
        var other = clicked+Number(dir);
        //update num
        if(dir){
            Folder.update({num: parseInt(clicked)}, {num: other}).exec(function(err1, folder1) {
                if(err1) {
                    console.log(err1);
                } else {
                }
                Folder.update({id:id}, {num: clicked}).exec(function(err2, folder2) {
                    if(err2) {
                        console.log(err2);
                    } else {
                        res.send(folder2[0]);
                    }
                });
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
	destroy: function (req, res) {
		var id = req.param("id");
		Folder.destroy({id: id}).done(function(err){
			if(err){
				console.log(err);
			} else {
			}
			res.end();
		});
	},

   reorder: function (req, res) {
      Folder.find()
      .sort({"num": 1})
      .exec(function(err, folders) {
        var num = 0;
        folders.forEach(function(folder) {
            folder.num = Number(num);
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
