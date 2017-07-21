const auth = require('./auth')
const { User } = require('./models')
const { log } = require('./util')

module.exports = (app, db) => {
	auth(app, db)

	app.get('/', (req, res) => {
		res.marko(require('../views/index'), {
			user: req.user,
		})
	})

	app.get('/signin', (req, res) => {
		if (req.user)
			res.redirect('/')

		res.marko(require('../views/signin'), {
			user: req.user,
			error: req.flash('error'),
		})
	})

	app.get('/me/avatar', (req, res) => {
		// TODO make this better

		if (req.user.avatar)
			res.end(new Buffer(req.user.avatar, 'hex'))
		else
			res.status(404).end()
	})
}
