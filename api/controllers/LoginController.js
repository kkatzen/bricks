/**
 * LoginController
 */
var passport = require('passport');
module.exports = {


  login: function(req, res) {
    res.view();
  },

  logout: function (req, res) {
    req.logout();
    res.redirect("/");
  },

  get: function (req, res) {
    res.send({displayName: req.session.passport.user});
  },

	authenticate: function (req, res) {
		var https = require("https");
		var vfykey = req.param("vfykey");
		var vfyreq = https.request({
			host: 'onyen.unc.edu',
			path: '/cgi-bin/unc_id/authenticator.pl/' + vfykey
		}, function (response) {
			var str = "";
			response.on('data', function (d) {
				str += d;
			});
			response.on('end', function () {
				var username, displayName;
				str = str.split("\n");
				for (var v in str) {
					var e = str[v].split(": ");
					if (e[1] == "pass") {
						username = e[0]
					} else if (e[0] == "displayName") {
						displayName = e[1]
					}
				}
				passport.authenticate('onyen', {username: username, displayName: displayName}, function (err, user, info) {
					if (err) {
						console.log("Error during authentication");
						return res.redirect("/");
					}
					if (!user) {
						console.log("Didn't get a user. This shouldn't be possible.");
						return res.redirect("/");
					}
					req.logIn(user, function (err) {
						console.dir(req.session.passport);
						console.dir(req.user);
						return res.redirect("/" + (req.param("d") || ""));
					});
				})(req, res);
			});
		});
		vfyreq.end();
		vfyreq.on('error', function (e) {
			console.err(e);
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to LoginController)
   */
  _config: {}
};
