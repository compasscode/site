const { Document } = require('camo')
const bcrypt = require('bcryptjs-then')

module.exports = class User extends Document {
	constructor() {
		super()

		this.username = {
			type: String,
			match: /[A-Za-z0-9_-]{1,15}/,
			required: true,
			unique: true }
		this.passhash = { type: String }
		this.joinDate = { type: Date, default: Date.now, required: true }
		this.avatar = Object // Buffer as object
		this.email = String

		this.twitterId = String
		this.githubId = String
		this.googleId = String
	}

	static isEmailAddress(test) {
		// loose email regex
		return (/.+\@.+\..+/).test(test)
	}

	static hashPassword(password) {
		return bcrypt.hash(password, 15)
	}

	comparePassword(password) {
		return bcrypt.compare(password, this.passhash)
	}
}
