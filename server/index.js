require('marko/node-require')

const { prod, path, log, db } = require('./util')
const config = require('./config')
const express = require('express')
const routes = require('./routes')
const session = require('express-session')
const Store = require('nedb-session-store')(session)

if (prod)
	log.info(`Running in PRODUCTION mode`)
else
	log.info(`Running in DEVELOPMENT mode`)

let app = express()

app.disable('x-powered-by')
app.use(require('marko/express')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('cookie-parser')())
app.use(session({
	store: new Store({ filename: 'sessions.db' }),
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
}))
app.use(require('connect-flash')())

app.use('/img', express.static(path('/img')))
app.use('/assets', express.static(path('/assets')))

log.info('Connecting to database...')
db.then(db => {
	log.success('Connected to database!')

	routes(app, db)

	app.all('*', (req, res) => {
		log.debug(`Hit 404 at ${req.path}`)

		res.status(404)
		res.marko(require('../views/404'), {
			user: req.user,
		})
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
	res.marko(require('../views/500'), {
		user: req.user,
	})
})

process.on('uncaughtException', err => {
	log.error(err)
	process.exit(1)
})

process.on('unhandledRejection', err => {
	log.error(err)
})

