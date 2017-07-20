require('marko/node-require')

const { prod, path, log, db } = require('./util')
const express = require('express')
const marko = require('marko/express')
const routes = require('./routes')

if (prod)
	log.info(`Running in PRODUCTION mode`)
else
	log.info(`Running in DEVELOPMENT mode`)

let app = express()

app.disable('x-powered-by')
app.use(marko())

app.use('/img', express.static(path('/img')))
app.use('/assets', express.static(path('/assets')))

log.info('Connecting to database...')
db.then(db => {
	log.success('Connected to database!')

	routes(app, db)

	app.all('*', (req, res) => {
		log.debug(`Hit 404 at ${req.path}`)

		res.status(404)
		res.marko(require('../views/404'))
	})

	app.listen(7070, () => {
		log.success('Listening at http://localhost:7070/')
	})
}).catch(err => {
	log.error(`Could not connect to database: ${err}`)
})

app.use((err, req, res, next) => {
	log.debug(`Hit 500 at ${req.path}`)
	log.error(err)

	res.status(500)
	res.marko(require('../views/500'))
})

process.on('uncaughtException', err => {
	log.error(err)
	process.exit(1)
})

process.on('uncaughtRejection', err => {
	log.error(err)
})

