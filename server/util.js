const chalk = require('chalk')
const config = require('./config')
const path = require('path')
const camo = require('camo')

module.exports = {
	prod: process.env.NODE_ENV === 'production',
	dev: process.env.NODE_ENV !== 'production',

	db: camo.connect(config.db),

	path(file) {
		return path.join(__dirname, '../', file)
	},

	log: {
		inspect(obj) {
			const { inspect } = require('util')
			module.exports.debug(inspect(obj, { depth: null, colors: true }))
		},

		debug(message) {
			if (config.loglevel > 4)
				console.log(chalk`{blue debug} {dim ${message}}`)
		},

		info(message) {
			if (config.loglevel > 3)
				console.log(chalk`{cyan info} ${message}`)
		},

		warn(message) {
			if (config.loglevel > 2)
				console.log(chalk`{yellow warn} ${message}`)
		},

		success(message) {
			if (config.loglevel > 2)
				console.log(chalk`{green success} {bold ${message}}`)
		},

		error(message) {
			if (config.loglevel > 1)
				console.log(chalk`{redBright error} {red ${message}}`)
		},
	},
}

if (!config.isPresent) {
	module.exports.log.warn('No config.json found; using default configuration')
}
