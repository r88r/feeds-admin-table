var fs = require('fs')
	, feedDataHelper = require('./data_helpers/feeds.js')
	
	, csv_feeds = require('./csv_renderers/feed-table')
	;

var HANDL = function(method) {

	var _method_ = method;

	return function(req, res, next) {
	
		console.log('[HANDL - ' + _method_ + '] type: '+req.params.datatype);
		//res.send( { error: 'test' });
	
		switch (method.toLowerCase()) {

			case 'get':
				this._get_(req, res);
				break;

			case 'post':
				this._post_(req, res);
				break;

		}
	
	}.bind(this);

}

HANDL.prototype._get_ = function(req, res) {
	console.log('_get_');
	console.dir(req.params);
	
	// require logged-in user for this whole command set
	if (!req.user || !req.user._id) {
		return res.send( { status: 'err', error: 'requires login' } );
	}
	
	var params = req.params;
	
	if (params && params.datatype) {
	
		switch (params.datatype) {
		
			case 'transactions':

				/*
				
				1. locations_by_user_id
				2. concat machine_ids from locations
					2a. allow to filter down to single machine_id for single zazzz reporting
						=> (link to it, by showing the zazzz machines as a linked list, if more than one)
				3. txModel.find machine_id $in machine_ids
				4. send new node in data, { machines: zmachines, transactions: transactions }
				
				*/
				
				if (req.user.isAdmin) {
					
					console.log('client id passed in? ' + req.query.client_id);
					console.log('typeof: '+(typeof(req.query.client_id)));
					
					if (req.query && req.query.client_id !== undefined) {
						req.session.client_id = req.query.client_id && req.query.client_id !== 'false' ? req.query.client_id : null;
					}
					
					console.log('stored in session: ' + req.session.client_id);

					if (req.session && (req.session.client_id || req.session.location_id || req.session.machine_id)) { // << figure out how to pass in a machine ID or client ID!
						// if any of these id's are present, then also get the Machines
						
						// get list by client:
						if (req.session.client_id) {
							//transactionDataHelper.client_find_all(req.session.client_id, req, res);
							console.log('GET TX BY CLIENT ID');
							transactionDataHelper.admin_find_by_client(req.session.client_id, req, res);

						} else if (req.session.location_id) {
							console.log('GET TX BY LOCATION ID');
							var loc_id = req.session.location_id;
							transactionDataHelper.location_find_all(loc_id, req, res);

						} else if (req.session.machine_id) {
							console.log('GET TX BY MACHINE ID');
							var z_id = req.session.machine_id;
							transactionDataHelper.machine_find_all(z_id, req, res);
						}
						
					} else {
						console.log('GET TX REGULAR');
						transactionDataHelper.admin_find_all(req, res);
					}
				
				} else {

					/****
						
						FIXME:
							first two below are generally wrong,
							we don't have a way to set the session.foo yet.
						
					****/
					if (req.session.location_id) {
						var loc_id = req.session.location_id;
						transactionDataHelper.location_find_all(loc_id, req, res);

					} else if (req.session.machine_id) {
						var z_id = req.session.machine_id;
						transactionDataHelper.machine_find_all(z_id, req, res);

					} else {
						var uid = req.user._id;
						transactionDataHelper.client_find_all(uid, req, res);
					}

				}
				break;

			
			case 'get-client':
				if (req.user.isAdmin) {
					//return res.status(500).send( { status: 'err', error: 'you are not an admin' } );
					clientDataHelper.getClient(req, res);
				} else {
					clientDataHelper.getCurrentClient(req, res);
				}
				break;

			default:
				res.status(500).send( { status: 'err', error: 'get-unhandled', datatype: params.datatype });
				break;
		}
	} else {
		res.send( { status: 'err', error: 'HANDL get- missing params' });
	}
}

HANDL.prototype._post_ = function(req, res) {
	console.log('_post_');
	console.dir(req.params);
	
	var params = req.params;
	
	if (params && params.datatype) {
	
		switch (params.datatype) {
		
			case 'export-feed-data':
				
				//res.send({ status: 'ok', msg: 'export-transactions test', data: req.body });
				
				if (!req.body || !req.body.export_feed_data) {
					res.send({ status: 'err', msg: 'no transactions found to export' });

				} else {
				
					var csv_data = csv_feeds( JSON.parse(req.body.export_feed_data) );
				
					if (csv_data) {
						res.writeHead(200, {'Content-Type': 'text/csv'});
						res.end( csv_data );
					} else {
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.end('failed to parse data for csv... stats:'+"\n" + JSON.stringify(csv_data, null, 4));
					}
					
					//fs.writeFileSync('check-csv-data.json', JSON.stringify(JSON.parse(req.body.export_feed_data), null, 4) );
				}
				break;

			default:	
				res.send( { status: 'err', error: 'post-unhandled', datatype: params.datatype, data: req.body });
				break;
		}
	} else {
		res.send( { status: 'err', error: 'HANDL post- missing params' });
	}
}

var GET = new HANDL('get');
var POST = new HANDL('post');

module.exports = {
	get: GET,
	post: POST
}

