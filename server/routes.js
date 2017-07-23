const auth = require('./auth')
const { User, Project } = require('./models')
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
			flash: { error: req.flash('error') },
		})
	})

	/****** PROFILES *******/

	// TODO

	app.get('/me/avatar', (req, res) => {
		if (!req.user) {
			req.flash('error', 'Please sign in')
			return res.redirect('/signin')
		}

		// TODO make this better

		if (req.user.avatar)
			res.end(new Buffer(req.user.avatar, 'hex'))
		else
			res.status(404).end()
	})

	app.get('/me/projects', async (req, res) => {
		if (!req.user) {
			req.flash('error', 'Please sign in')
			return res.redirect('/signin')
		}

		// TODO split project lists into ten-project chunks
		// so we don't have to load every single one of a user's
		// projects at once

		res.marko(require('../views/projects-list'), {
			user: req.user,
			projects: await Project.find({ authorUsername: req.user.username }, {
				populate: [ 'name', 'isShared', 'sharedOn' ],
				sort: 'changedOn',
				// limit: TODO
				// skip: TODO (pagination)
			}),
		})
	})

	/****** PROJECTS *******/

	app.get('/editor', (req, res) => {
		res.marko(require('../views/editor'), {
			user: req.user,
		})
	})

	/****** SETTINGS *******/

	let settingsTabs = {
		profile: 'Profile',
		account: 'Account',
	}

	app.get('/me/settings', (req, res) => res.redirect('/me/settings/profile'))
	app.get('/me/settings/:tab', (req, res) => {
		if (!req.user) {
			req.flash('error', 'Please sign in')
			return res.redirect('/signin')
		}

		let tabName = settingsTabs[req.params.tab]

		if (!tabName)
			return res.redirect('/me/settings')

		res.marko(require('../views/settings'), {
			user: req.user,
			tabName,
			flash: { error: req.flash('error'), info: req.flash('info') },
		})
	})

	app.post('/me/settings/account', async (req, res) => {
		if (!req.user) {
			req.flash('error', 'Please sign in')
			return res.redirect('/signin')
		}

		if (typeof req.body.username === 'string') {
			// Change username
			if (req.body.username.length === 0) {
				req.flash('error', 'Username cannot be empty')
			} else if (req.body.username === req.user.username) {
				req.flash('error',
				  `Your username is already <b>${req.body.username}</b>`)
			} else if (!User.usernameIsValid(req.body.username)) {
				req.flash('error',
				  `Sorry, the username <b>${req.body.username}</b> is invalid`)
			} else if (req.body.username.toLowerCase() !== req.user.usernameLower
			  && await User.usernameIsTaken(req.body.username)) {
				req.flash('error',
				  `Sorry, the username <b>${req.body.username}</b> is taken`)
			} else {
				req.user.username = req.body.username
				req.user.usernameLower = req.body.username.toLowerCase()
				await req.user.save()

				req.flash('info',
				  'Changed username successfully &mdash; '
				  + `Your new username is <b>${req.body.username}</b>`)
			}
		}

		if (typeof req.body.password === 'string') {
			// Change password
			if (req.body.password.length === 0) {
				req.flash('error', 'Password cannot be empty')
			} else if (!!req.user.passhash
			    && !(await req.user.comparePassword(req.body.oldPassword))) {
				req.flash('error', 'Current password is incorrect')
			} else {
				req.user.passhash = await User.hashPassword(req.body.password)
				await req.user.save()

				req.flash('info', !req.user.passhash
				  ? 'Set password successfully'
				 	: 'Changed password successfully')
			}
		}

		if (typeof req.body.email === 'string') {
			// Change email address
			if (!User.isEmailAddress(req.body.email)) {
				req.flash('error', 'Email address is invalid')
			} else {
				// TODO confirmation emails and stuff
				await User.sendConfirmationEmail(/* TODO */)

				log.warn('Tried to change email address, but it\'s not implemented')
				req.flash('error', 'This feature is not implemented yet')
			}
		}

		res.redirect('/me/settings/account')
	})
}
