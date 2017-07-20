module.exports = (app, db) => {
	app.get('/', (req, res) => {
		res.marko(require('../views/index'))
	})
}
