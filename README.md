# Compass

Compass is a fun and free online platform for learning web development and sharing with others.

* Learn quickly with documentation and tutorials built directly into the editor
* Share your creations with a community of other learners
* See what others are creating

This repository contains the server/site sourcecode. **Note: it's currently not live, nor anywhere near completion!**

### Installation
If you are interested in running a local copy of the Compass server, you'll need at least [Node.js 6](https://nodejs.org/en/download/current/).

```sh
$ git clone https://github.com/compasscode/site compass --recursive
$ cd compass

$ npm install
$ npm install nedb
```

Finally, the server can be started using
```sh
$ npm start
```
You may then visit [localhost:7070](http://localhost:7070/).

### Development
During development, you will need to build assets every time you change them. There is a helper script for automatically building assets whenever they are changed:
```sh
$ npm run watch
```

If you'd prefer for builds to happen when you ask, do
```sh
$ npm run build
```
instead.

### Configuration
You can optionally configure options in a `config.json`. It's read as [JSON5](http://json5.org/), so comments are valid etc.

Here are the options and their defaults:
```js
{
	db: 'nedb://', // see https://git.io/v7fm0
	loglevel: 'info', // one of: 'debug', 'info', 'warn', 'success', 'error', 'none'
	sessionSecret: 'hypersecurepassphrase',
	sso: {
		twitter: {
			// see https://apps.twitter.com
			consumerKey: null,
			comsumerSecret: null,
		},
		github: {
			// see https://git.io/v7JOA
			clientID: null,
			clientSecret: null,
		},
		google: {
			// see https://console.developers.google.com/
			// enable the Google+ API
			clientID: null,
			clientSecret: null,
		},
	},
}
```

---

Pull requests are greatly appreciated, and feel free to leave/comment on issues on the [issue tracker](https://github.com/compasscode/site/issues), or, if they relate to the project editor, on [the editor issue tracker](https://github.com/compasscode/editor/issues).
