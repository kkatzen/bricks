/**
 * UserController
 */

module.exports = {
   
    setup: function (req, res) {
        if (!req.user) {
            return res.redirect("/login");
        }
        User.find({admin: true}).exec(function(err, users) {
            if(users.length == 0) {    
                return res.redirect("/setup");
            } else {
                return res.redirect("/");
            }
        });
    },
    read: function (req, res) {
        var id = req.param("id") || null;
        var onyen = req.param("onyen") || null;

        if(id){
                User.findOne({id:id}).exec(function (err, user) {
                if (err) {
                    res.send(500, {error: "DB error finding user"});
                    return;
                } else {
                    res.send(user);
                }
            });
        }else if(onyen){
                User.findOne({username:onyen}).exec(function (err, user) {
                if (err) {
                    res.send(500, {error: "DB error finding user"});
                    return;
                } else {
                    res.send(user);
                }
            });
        }else {
            User.find()
            .sort({"displayName": 1})
            .exec(function(err, users) {
                res.send(users);
            });
        }

       
    },
    readAdmin: function (req, res) {
        User.find({admin: true})
        .sort({"displayName": 1})
        .exec(function(err, users) {
            if(err) {
                console.log(err);
            } else {
                res.send(users);
            }
        });
    },
    setAdmin: function (req, res) {
        if(req.user.admin) {
            var id = req.param("user");
            User.update({username: id}, {admin: true}).exec(function(err, user) {
                if(err) {
                    console.log(err);
                    res.send(500, {error: "DB Error updating user"});
                } else if (user.length > 0) {
                    res.send(user[0]);
                } else {
                    console.log("no user with that id");
                    res.send(null);
                }
            });
        } else {
            User.find({admin: true}).exec(function(err, user) {
                if(user.length > 0) {
                    console.log("User is not admin and therefore cannot set admin");
                } else {
                     var id = req.user.id;
                     User.update({id: id}, {admin: true}).exec(function(err, user) {
                        if(err) {
                            res.send(500, {error: "DB Error updating user"});
                        } else {
                            res.redirect("/admin");
                        }
                    });
                }
            });
        }
    },

    removeAdmin: function (req, res) {
        var id = req.param("id");
        User.update({id: id}, {admin: false}).exec(function(err, user) {
            if(err) {
                console.log(err);
            } else {
                res.send(user);
            }
        });
    },

    //Save student's current draft of code to appear next time they reload the window
    saveCode: function (req, res) {
        var code = req.param("code");
        var username = req.user.username;
        User.update({username: username}, {latestCode: code}).exec(function(err, user) {
            if(err) {
                console.log(err);
            } else {
            }
        });
    },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
