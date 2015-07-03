// move these somewhere:

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
 
  // The accept-callback still allows us to decide whether to 
  // accept the connection or not. 
  //accept(null, true);
 
  // OR 
  // If you use socket.io@1.X the callback looks different 
  accept();
}
 
function onAuthorizeFail(data, message, error, accept){
  if (error) { throw new Error(message); }
  console.log('failed connection to socket.io:', message);
  console.log(data);
  console.log(error);
 
  // We use this callback to log all of our failed connections. 
  //accept(null, false);
 
  // OR 
  // If you use socket.io@1.X the callback looks different 
  // If you don't want to accept the connection 
  if (error) { accept(new Error(message)); }
  // this error will be sent to the user as a special error-package 
  // see: http://socket.io/docs/client-api/#socket > error-object 
}

// simple webserver to run the react app

var guid = (function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	};
})();

var express = require('express')
	, config = require('./config')
	, fs = require('fs')
	, PORT = 11082
	, app = express()
	, socketServer = require('http').Server(app)
	, io = require('socket.io')(socketServer)
	, passport = require('passport')
	, passportSocketIo = require("passport.socketio")
	, flash = require('connect-flash')
	, morgan       = require('morgan')
	, cookieParser = require('cookie-parser')
	, bodyParser   = require('body-parser')
	, session      = require('express-session')
	, favicon 	   = require('serve-favicon')
	, expressHbs = require('express-handlebars')

	, RedisStore = require("connect-redis")(session)
	, sessionStore = new RedisStore( config.redis_host ) // XXX redis server config

	// barney api:
	, feeds_table_api = require('./feeds-table-api')
	
	;

config.session_secret = 'sociative-r88r-super-secret-cookie-code';

// not sure this is needed 
//io.listen(socketServer);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('config', config);

// dev note: look into https://github.com/donpark/hbs
// in particular, support for "locals" to be injected into the template
// (similar concept to smooty supervars)
app.engine('html', expressHbs({extname:'html', defaultLayout:'main.html'}));
app.set('view engine', 'html');

var sessionMiddleware = session({
    store: sessionStore,
    secret: config.session_secret,
    resave: true,
    saveUninitialized: true
});

// passport requirements:
require('./config/passport')(passport); // pass passport for configuration
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/gfx/favicon.ico'));

//app.use(express.logger('dev'));
//app.use(express.json());

feeds_table_api.use_io(io);

socketServer.listen(PORT, function() {
	console.log('Feed Table is ON!!!');
});

/*

SOCKET.IO SESSIONS

	below solution is from:
	https://github.com/expressjs/session/issues/58

	more info, maybe try this package sometime:
	https://github.com/xpepermint/socket.io-express-session
		(...........which appears to be the same solution as below)
//* /
hmmm not working:
io.use(function(socket, next) {
	var req = socket.handshake;
    req.originalUrl = '/'; //Whatever your cookie path is
    sessionMiddleware(req, {}, next);
});
*/

//With Socket.io >= 1.0 
/*
io.use(passportSocketIo.authorize({
	passport: passport,
	cookieParser: cookieParser,       // the same middleware you registrer in express 
	key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id 
	secret:       config.session_secret,    // the session_secret to parse the cookie 
	store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please 
	success:      onAuthorizeSuccess,  // *optional* callback on success - read more below 
	fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below 
}));
*/

io.on('connection', function(conn) {
	
	console.log("------------------------------\nyay we have a client connection\n------------------------------\n");
	//console.log('session???');
	//console.log( Object.keys(conn) );
	//console.log( conn.client.request.user );
	
	//if (conn.client && conn.client.request && conn.client.request.user) {
	if (conn) {
		console.log('socket user auth is TURNED OFF!!!!!!!!!!!!!');
		// authenticated user

		conn.on('get-feeds-by-namespace', function(data) {
			feeds_table_api.get_feeds_by_namespace(conn, data);
		});
	
		conn.on('get-namespaces', function(data) {
			feeds_table_api.get_namespaces(conn);
		});
	
		conn.on('close', function() {
			console.log('[socket] we conn gots a close message');
			console.dir(arguments);
		});

	/*
	// not used, but stubbed in here and in feeds_table_api:
		conn.on('update-zazzz-session', function(data) {
			feeds_table_api.update_zazzz_session(data, conn);
		});
	*/	

	} else {
		conn.disconnect();
	}

});
