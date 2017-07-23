const { Document } = require('camo')
const shortid = require('shortid')

module.exports = class Project extends Document {
	constructor() {
		super()

		this.name = String
		this.description = String
		this.code = Object
		this.authorUsername = String

		this.isShared = { type: Boolean, default: false }
		this.sharedOn = Date
		this.changedOn = { type: Date, default: Date.now }
	}

	changeCode(code) {
		this.code = code
		this.changedOn = Date.now()
		// must call .save afterwards
	}

	setShared(shared = true) {
		this.isShared = shared
		this.sharedOn = Date.now()
		// must call .save afterwards
	}

	static create(...args) {
		let prj = Project.create(...args)
		prj._id = shortid.generate()
	}
}
