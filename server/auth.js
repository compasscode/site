const { log, prod } = require('./util')
const config = require('./config')
const { User } = require('./models')
const fetch = require('node-fetch')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

module.exports = (app, db) => {
	passport.use(new LocalStrategy(async (username, pass, cb) => {
		try {
			let user = await User.findOne({ username })
			if (user === null)
				return cb(null, false, { message: `User doesn't exist` })
			let valid = await user.comparePassword(pass)

			if (!valid)
				return cb(null, false, { message: `Password invalid` })

			return cb(null, user)
		} catch(e) {
			cb(e)
		}
	}))

	passport.serializeUser((user, done) => {
		done(null, user._id)
	})

	passport.deserializeUser((_id, done) => {
		User.findOne({ _id })
			.then(user => done(null, user))
			.catch(err => done(err))
	})

	app.use(passport.initialize())
	app.use(passport.session())

	app.get('/signin/userexists', async (req, res) => {
		let user = await User.findOne({ username: req.query.username })
		// TODO tell client when an account doesn't actually have a
		//      password associated with it i.e. it was created with some
		//      sso provider
		res.json(user !== null)
	})

	app.post('/signin', passport.authenticate('local', {
		failureRedirect: '/signin',
		failureFlash: true,
	}), (req, res) => {
		// If this function gets called, authentication was successful.
		log.debug(`${req.user.username} signed in using username/password`)
		res.redirect('/')
	})

	// Twitter
	if (config.sso && config.sso.twitter) {
		passport.use(new TwitterStrategy({
			consumerKey: config.sso.twitter.consumerKey,
			consumerSecret: config.sso.twitter.consumerSecret,
			callbackURL: (prod ? 'https://compass.sh' : 'http://localhost:7070')
				+  '/signin/twitter/callback',
			 includeEmail: true,
		}, async (token, tokenSecret, profile, cb) => {
			let user = await User.findOne({ twitterId: profile.id })

			if (user === null) {
				// we need to create this user!
				// let's pass the request onto another handler below.
				cb({
					is: 'twitter',
					profile,
				})
			} else cb(null, user)
		}))

		app.get('/signin/twitter', passport.authenticate('twitter', {
			scope: [ 'include_email=true' ] }))
		app.get('/signin/twitter/callback',
		  passport.authenticate('twitter', {
		  	failureRedirect: '/signin/createaccount/twitter',
		  	failureFlash: true }), (req, res) => {
		  	log.debug(`${req.user.username} signed in using Twitter`)
		  	res.redirect('/')
		  })

		app.use(async (err, req, res, next) => {
			if (err.is === 'twitter') {
				let { profile } = err

				res.marko(require('../views/createaccount'), {
					user: req.user,
					profile,
					provider: 'Twitter',
				})
			} else next()
		})
	}

	// GitHub
	if (config.sso && config.sso.github) {
		passport.use(new GitHubStrategy({
			clientID: config.sso.github.clientID,
			clientSecret: config.sso.github.clientSecret,
			callbackURL: (prod ? 'https://compass.sh' : 'http://localhost:7070')
				+  '/signin/github/callback',
		}, async (accessToken, refreshToken, profile, cb) => {
			let user = await User.findOne({ githubId: profile.id })

			if (user === null) {
				// we need to create this user!
				// let's pass the request onto another handler below.
				cb({
					is: 'github',
					profile,
				})
			} else cb(null, user)
		}))

		app.get('/signin/github', passport.authenticate('github'))
		app.get('/signin/github/callback',
		  passport.authenticate('github', {
		  	failureRedirect: '/signin/createaccount/github',
		  	failureFlash: true }), (req, res) => {
		  	log.debug(`${req.user.username} signed in using GitHub`)
		  	res.redirect('/')
		  })

		app.use(async (err, req, res, next) => {
			if (err.is === 'github') {
				let { profile } = err

				profile.photos = [ { value: profile._json.avatar_url } ]
				res.marko(require('../views/createaccount'), {
					user: req.user,
					profile,
					provider: 'GitHub',
				})
			} else next()
		})
	}

	// Google
	if (config.sso && config.sso.google) {
		passport.use(new GoogleStrategy({
			clientID: config.sso.google.clientID,
			clientSecret: config.sso.google.clientSecret,
			callbackURL: (prod ? 'https://compass.sh' : 'http://localhost:7070')
				+  '/signin/google/callback',
		}, async (accessToken, refreshToken, profile, cb) => {
			let user = await User.findOne({ googleId: profile.id })

			if (user === null) {
				// we need to create this user!
				// let's pass the request onto another handler below.
				cb({
					is: 'google',
					profile,
				})
			} else cb(null, user)
		}))

		app.get('/signin/google', passport.authenticate('google', {
			scope: [ 'profile', 'email' ] }))
		app.get('/signin/google/callback',
		  passport.authenticate('google', {
		  	failureRedirect: '/signin/createaccount/google',
		  	failureFlash: true }), (req, res) => {
		  	log.debug(`${req.user.username} signed in using Google`)
		  	res.redirect('/')
		  })

		app.use(async (err, req, res, next) => {
			console.log(err)
			if (err.is === 'google') {
				let { profile } = err

				// google doesnt have usernames,
				// so we'll make one up using the displayname
				profile.username = profile.displayName
					.replace(/[^A-Za-z0-9_-]/g, '-')

				res.marko(require('../views/createaccount'), {
					user: req.user,
					profile,
					provider: 'Google',
				})
			} else next()
		})
	}

	app.post('/signin/createaccount', async (req, res) => {
		log.debug(`Creating user: ${req.body.username}`)

		let avatar
		if (req.body.avatar) {
			avatar = await fetch(req.body.avatar).then(res => res.buffer())
			avatar = avatar.toJSON()
			log.inspect(avatar)
		}

		try {
			var user = await User.create({
				username: req.body.username,
				passhash: req.body.password
					? await User.hashPassword(req.body.password)
					: undefined,
				email: req.body.email,
				twitterId: req.body.twitterId,
				githubId: req.body.githubId,
				googleId: req.body.googleId,
				avatar,
			})

			user = await user.save()
		} catch(e) {
			log.warn(e + ' thrown at /signin/createaccount')

			req.flash('error', `Username already taken`)
			return res.status(403).redirect('/signin')
		}

		log.success(`Created user: ${user.username}`)
		log.inspect({
			username: user.username,
			id: user._id,
			email: user.email,
			joinDate: user.joinDate
		})

		req.login(user, err => {
			if (err) throw err
			res.redirect('/me')
		})
	})

	app.post('/signin/signout', (req, res) => {
		req.logout()
		res.status(200).end()
	})
}
