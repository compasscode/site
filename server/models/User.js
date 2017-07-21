const { Document } = require('camo')
const bcrypt = require('bcryptjs-then')

const usernamesNotAllowed = [
	/* Root URLs we don't want people having */
	'about', 'help', 'me', 'forums', 'store', 'donate', 'statistics',
	'wiki', 'parents', 'educators', 'developers',
]

module.exports = class User extends Document {
	constructor() {
		super()

		this.username = {
			type: String,
			match: /^[A-Za-z0-9_-]{1,20}$/,
			validate: username => !usernamesNotAllowed.includes(username),
			required: true,
			unique: true }
		this.usernameLower = String
		this.passhash = { type: String }
		this.joinDate = { type: Date, default: Date.now, required: true }

		/* Connections */
		this.twitterId = String
		this.githubId = String
		this.googleId = String
		this.signedUpWith = {
			type: String, choices: [ 'Twitter', 'GitHub', 'Google' ] }

		/* Settings */
		// TODO: is there a more efficient way to store avatars?
		this.avatar = Object // Buffer as object
		this.email = { type: String, required: true }
		this.bio = String
		this.url = String
		this.location = String
	}

	static usernameIsValid(username) {
		if (usernamesNotAllowed.includes(username))
			return false

		return (/^[A-Za-z0-9_-]{1,20}$/).test(username)
	}

	static usernameIsTaken(username) {
		return User.findOne({ usernameLower: username.toLowerCase() })
			.then(result => result !== null)
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

	static async sendConfirmationEmail() {
		// TODO
	}
}
