var util = require("util");
var Strategy = require("passport-strategy");

function OnyenStrategy (options, verify) {
	if (typeof options == "function") {
		verify = options;
		options = {};
	}
	if (!verify) throw new TypeError("OnyenStrategy requires a verify callback");
	Strategy.call(this);
	this.name = 'onyen';
	this._verify = verify;
}

util.inherits(OnyenStrategy, Strategy);

OnyenStrategy.prototype.authenticate = function (req, options) {
	options = options || {};

	var username = options.username;
	var displayName = options.displayName;

	var self = this;

	function verified(err, user, info) {
		if (err) {
			return self.error(err);
		}
		if (!user) {
			return self.fail(info);
		}
		self.success(user, info);
	}

	try {
		this._verify(username, displayName, verified);
	} catch (ex) {
		return self.error(ex);
	}
};

module.exports = OnyenStrategy;
