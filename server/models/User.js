const { Document } = require('camo')
const bcrypt = require('bcryptjs-then')

module.exports = class User extends Document {
	constructor() {
		super()

		this.username = {
			type: String,
			match: /[A-Za-z0-9][A-Za-z0-9-_]+/,
			required: true,
			unique: true }
		this.passhash = { type: String }
		this.joinDate = { type: Date, default: Date.now, required: true }
		this.avatar = Object // Buffer as object

		this.twitterId = String
		this.githubId = String
	}

	static hashPassword(password) {
		return bcrypt.hash(password, 15)
	}

	comparePassword(password) {
		return bcrypt.compare(password, this.passhash)
	}
}
