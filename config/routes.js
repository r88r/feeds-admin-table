var dataHandler = require('../dataHandler')
	, AuthSuccessRedirect = '/feeds'
;

module.exports = function(app, passport) {

// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.get('/robots.txt', function(req, resp, next) {
		resp.send("User-agent: *\nDisallow: /\n");
	});


	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.html', {
			user : req.user
		});
	});

	// FEED TABLE SECTION =========================
	app.get('/feeds', isLoggedIn, function(req, res) {
		var passthru = get_authed_passthrough(req);
		res.render('feeds.html', {
			passthru: JSON.stringify(passthru),
			bundlename: 'Feeds'
		});
	});

	// DATA =========================
	app.get('/data/:datatype/:extra', isLoggedIn, dataHandler.get);
	app.get('/data/:datatype', isLoggedIn, dataHandler.get);

	app.post('/data/:datatype/:extra', isLoggedIn, dataHandler.post);
	app.post('/data/:datatype', isLoggedIn, dataHandler.post);

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.html', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the login page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/kf-signup', function(req, res) {
			res.render('signup.html', { message: req.flash('signupMessage') });
		});

		// process the signup form
		app.post('/kf-signup', passport.authenticate('local-signup', {
			successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section
			failureRedirect : '/kf-signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section
				failureRedirect : '/'
			}));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.html', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section,
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

		// the callback after google has authorized the user
		app.get('/connect/google/callback',
			passport.authorize('google', {
				successRedirect : AuthSuccessRedirect, // '/profile' redirect to the secure profile section
				failureRedirect : '/'
			}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', isLoggedIn, function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', isLoggedIn, function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// twitter --------------------------------
	app.get('/unlink/twitter', isLoggedIn, function(req, res) {
		var user           = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// google ---------------------------------
	app.get('/unlink/google', isLoggedIn, function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	
	console.log('[isLoggedIn] is DISABLED...');
	return next();
	
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}


function isAdmin(req, res, next) {

	console.log('[isAdmin] is DISABLED...');
	return next();
	
	if (req.isAuthenticated() && req.user && req.user.isAdmin)
		return next();

	res.redirect('/');
}

function get_authed_passthrough(req, extra) {

	if (req.isAuthenticated() && req.user) {
		var obj = {
			isAdmin: req.user.isAdmin
		};
	} else {
		var obj = {
			// nothing defined for non-user/admin yet
		};
	}
	if (extra && typeof extra == 'object') {
		var keys = Object.keys(extra);
		keys.forEach(function(k) {
			obj[k] = extra[k];
		});
	}
	return obj;
}
