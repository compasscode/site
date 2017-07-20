const path = require('path')
const fs = require('fs')
const json = require('json5')

let configStr
let isPresent
try {
	configStr = fs.readFileSync(
	  path.join(__dirname, '../', 'config.json'), 'utf8')
	isPresent = true
} catch(e) {
	configStr = '{}'
	isPresent = false
}

let config = json.parse(configStr)
let defaults = {
	db: 'nedb://database.db',
	loglevel: 'info',
}

function loglevelInt() {
	switch (config.loglevel) {
		case 'debug':
			return 5
		default:
		case 'info':
			return 4
		case 'warn':
		case 'success':
			return 3
		case 'error':
			return 2
		case 'none':
			return 1
	}
}

config = Object.assign({}, defaults, config)
config.loglevel = loglevelInt()
config.isPresent = isPresent
module.exports = config
