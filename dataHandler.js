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

