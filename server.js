require('marko/node-require')

const express = require('express')
const marko = require('marko/express')

let app = express()

app.disable('x-powered-by')
app.use(marko())

app.use('/img', express.static(__dirname + '/img'))
app.use('/assets', express.static(__dirname + '/assets'))

app.get('/', (req, res) => {
	res.marko(require('./views/index'))
})

app.listen(7070, () => {
	console.log('Listening at http://localhost:7070/')
})
