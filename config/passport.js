var passport = require('passport');
var OnyenStrategy = require('../OnyenStrategy');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne(id).exec(function(err, user) {
        done(null, user);
    });
});

passport.use(new OnyenStrategy(function(username, displayName, done) {
	User.findOne({username: username}).done(function(err, user) {
		if (err) {
			return done(err);
		}
		if (!user) {
            var latestCode = " ";
			User.create({username: username, displayName: displayName, latestCode: latestCode}).done( function (err, user) {
				if (err) {
					console.log("Couldn't put user into DB");
					console.dir(err);
					return done(err);
				} else {
					return done(null, user);
				}
			});
		} else {
			return done(null, user);
		}
	});
}));

module.exports = {
    express: {
        customMiddleware: function(app) {
            console.log('express middleware for passport');
            app.use(passport.initialize());
            app.use(passport.session());
        }
    }
};
