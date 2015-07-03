var request = require('request')
	, config = require('../config')
	, io_ref = null

	;

var FEED_TABLE_API = module.exports = {}

// not the best, but ok for now
FEED_TABLE_API.use_io = function(io) {
	io_ref = io;
}

// this is a broadcast command, we're not using it yet in this app
FEED_TABLE_API.send_sockets = function(command, data) {
	if (!io_ref) {
		throw new Error('no IO reference to broadcast with!');
	}
	// broadcast to everyone command:
	//console.log('broadcast dammit! command: '+command);
	//console.log( JSON.stringify(data) );
	io_ref.sockets.emit(command, data);
}

var ns = [
	'AMOS', 'BBM', 'CRPT', 'DOG', 'ENJI', 'FOOD', 'MNT', 'MOM', 'MSFT', 'Meta', 'NL', 'NTL', 'OGDEN', 'OPT', 'PCT', 'REN', 'ROB', 'SR', 'STAGE', 'TEN', 'TOP', 'TRV', 'TST', 'V3A', '_ALL_'
]

FEED_TABLE_API.get_namespaces = function(conn) {
	conn.emit('namespaces-data', { status: 'ok', data: { namespaces: ns } });
}

FEED_TABLE_API.get_feeds_by_namespace = function(conn, data) {
	//conn.emit('PONG', data);
	if (!data || !data.ns) {
		return conn.emit('error: no namespace to get feeds with');
	}
	var url = 'http://e4brad.r88r.net/v3/monitor_data?ns=' + data.ns;

	request.get({
		uri: url,
		json: true
	}, function(err, response, body) {
		if (err) {
			return conn.emit('error getting feed data', { status: 'err', error: err });
			console.log('error getting feed data');
			console.dir(err);
		} else {
			if (typeof body === 'string') {
				console.log(' .>>>>>>> had to PARSE the BODY');
				try {
					body = JSON.parse(body);
				} catch(e) {
					body = false;
				}
			}
			if (body && body.data) {
				if (!(body.data instanceof Array)) {
					var k = Object.keys(body.data)
						, newbody = [];
					k.forEach(function(context) {
						newbody.push(body.data[context]);
					});
					body.data = newbody;
				}
				return conn.emit('feeds-data', { status: 'ok', data: { feeds: body.data } });
			}
			return conn.emit('error getting feed data', { status: 'err', error: 'no data returned from body', body: body });
		}
	});
}

FEED_TABLE_API.handle_command = function(command, parsed) {
	
	var commandHandle = command ? command.replace(/-([a-z])/gi, function(s, group1) {
		return group1.toUpperCase();
	}) : false;

	function send_socket_data(data) {
		
		if (!data) {
			console.log('[send_socket_data] no data to send, skip it');
			return;
		}
		
		var rdata = {
			// later, we might use some specific refs:
			//ref: jdata.params.ref,
			success: true,
			action: command,
			data: {
				session: data
			}
		}
		
		// extra handling here....
		if (FEED_TABLE_API[commandHandle]) {
			FEED_TABLE_API[commandHandle](parsed);
		} else if (commandHandle) {
			console.error('ERROR! unhandled command: ' + command + ', ' + commandHandle);
		}
		
	}

	if (parsed) {

		send_socket_data(parsed);
	
	} else {

		console.log('ERROR! no parseable session data from socket');

	}
}
