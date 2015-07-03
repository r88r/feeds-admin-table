var objectMerge = require('object-merge')
	;

var HANDLER = module.exports = {

	admin_find_all: function(req, res) {
		
		clientModel.find({}).sort({ name: 1 }).exec(function(err, clients) {
			if (err) return res.send({ status: 'err', server_error: err });
			
			if (!clients) {
				return res.send({ status: 'err', msg: 'no clients found', data: [] });
			}
			
			// drop Mongoose model restrictions for direct attachment of Locations inside a Client
			clients = JSON.parse(JSON.stringify(clients));
			
			var pingbacks = 0;

			function _respond_() {
				if (pingbacks == clients.length) {
					return res.send({ status: 'ok', data: clients });
				}
			}

			clients.forEach(function(C, idx) {
				locModel.find({ client_id: C._id }, function(err, locations) {
					if (locations) C.locations = locations;
					pingbacks += 1;
					_respond_();
				});
			});
			
		});
		
	},
	
	getClient: function(req, res) {
		
		// allowing both get and post methods for the moment
		var params = req.method.toLowerCase() == 'post' ? req.body : req.query;
		
		if (!params) {
			return res.status(500).send({ status: 'err', msg: '[get client] no data found' });
		}
		
		// eventually expand to get by more than just id,
		// by switching on inbound data (role-protected of course)
		
		var id = params.id;
		if (!id) {
			return res.status(500).send({ status: 'err', msg: '[get client] no id' });
		}
		
		clientModel.findOne({ _id: id }, function(err, data) {
			if (err) return res.send({ status: 'err', server_error: err });
			
			// drop Mongoose model restrictions for direct attachment of Locations inside a Client
			data = JSON.parse(JSON.stringify(data));
			
			locModel.find({ client_id: data._id }, function(err, locations) {
				if (locations) data.locations = locations;
				return res.send({ status: 'ok', data: data });
			});
		});
		
	},
	
	// get the client data for the current logged in user, if any
	getCurrentClient: function(req, res) {
		if (req.user && req.user.client_id) {
			switch (req.method.toLowerCase()) {
				case 'post':
					if (!req.body) { req.body = {} }
					req.body.id = req.user.client_id;
					break;
				case 'get':
					if (!req.query) { req.query = {} }
					req.query.id = req.user.client_id;
					break;
			}
			return HANDLER.getClient(req, res);
		} else {
			return res.status(500).send({ status: 'err', msg: '[get current client] no client ID found' });	
		}
		
	},
	
	admin_save: function(req, res) {
		if (!req.user.isAdmin) {
			return res.status(500).send({ status: 'err', msg: 'unauthorized request' });
		}
		var cData = req.body;
		if (!cData) {
			return res.status(400).send({ status: 'err', msg: 'missing data' });
		}
		
		/*
			/// ADMIN ONLY!!!! because of add or update, and handling multiple client _ids
			1. client exists? save or update
			2. locations all exist? save or update each
			3. return full client
				clientDataHelper.get_by_id(_id, req, res);
		*/
		
		var locations = extract_locations(cData);
		
		console.log('ok, try and update or save a client...');

		clientModel.findOne({ _id: cData._id }, function(err, CLIENT) {
			if (err) {
				return res.status(500).send({ status: 'err', msg: '[admin] client find error', error: err });
			}
			if (CLIENT) {
				var cObj = CLIENT.toObject();
				cObj = objectMerge(cObj, cData);
				delete cObj._id;
				clientModel.update({ _id: CLIENT._id }, cObj, function(err, ok) {
					if (err) {
						return res.status(500).send({ status: 'err', msg: '[admin] client update error', error: err });
					} else {
						cObj._id = CLIENT._id;
						return update_existing_locations(res, cObj, locations);
					}
				});
			} else {
				CLIENT = new clientModel(cData);
				CLIENT.save(function(err, newClient) {
					if (err) {
						return res.status(500).send({ status: 'err', msg: '[admin] client save error', error: err });
					} else {
						return add_new_locations(res, newClient, locations);
					}
				});
			}
		});
	
	},

	client_update: function(req, res) {
		/*
			1. get client associated with this user (if none, return error)
			2. save client data (never save new one!!!!)
			3. return full client
				clientDataHelper.get_by_id(_id, req, res);
		*/
		var cData = req.body;
		if (!cData) {
			return res.status(400).send({ status: 'err', msg: 'missing data' });
		}
		
		var locations = extract_locations(cData);

		clientModel.findOne({ _id: cData._id }, function(err, CLIENT) {
			if (err) {
				return res.status(500).send({ status: 'err', msg: 'client find error', error: err });
			}
			if (CLIENT) {
				var cObj = CLIENT.toObject();
				cObj = objectMerge(cObj, cData);
				delete cObj._id;
				clientModel.update({ _id: CLIENT._id }, cObj, function(err, ok) {
					if (err) {
						return res.status(500).send({ status: 'err', msg: '[admin] client update error', error: err });
					} else {
						cObj._id = CLIENT._id;
						return update_existing_locations(res, cObj, locations);
					}
				});
			} else {
				return res.status(500).send({ status: 'err', msg: 'client update error [2]', error: err });
			}
		});
	},
	
}

function extract_locations(cData) {
	var locations = cData.locations
		, _locations = {
			existing: [],
			add: [],
			remove: cData.removeLocations || false
		}
		;

	cData.locations = [];

	if (locations && locations.length) {
		locations.forEach(function(L) {
			if (L._id) {
				_locations.existing.push(L);
				cData.locations.push(L._id);
			} else {
				_locations.add.push(L);
			}
		});
	}
	return _locations;	
}

function update_existing_locations(res, cData, locations) {
	console.log('[update_existing_locations]');
	if (locations && locations.existing && locations.existing.length) {
		var pingbacks = 0
			, data = locations.existing
			;

		function _respond_() {
			if (pingbacks == data.length) {
				return add_new_locations(res, cData, locations);
			} else {
				console.log('still waiting for more.... ('+pingbacks+' == '+data.length+')');
			}
		}

		data.forEach(function(LOCATION, idx) {
			console.log('try to update, _id: '+LOCATION._id);
			var lObj = JSON.parse( JSON.stringify(LOCATION) );
			delete lObj._id;
			locModel.update({ _id: LOCATION._id }, lObj, function(err, ok) {
				if (err) {
					// throw an error????
					return res.status(500).send({ status: 'err', msg: 'failed to update location, name: ' + lObj.name, err: err });
				}
				pingbacks += 1;
				_respond_();
			});
		});
	} else {
		console.log('NO UPDATE ONES, carry on');
		return add_new_locations(res, cData, locations);
	}
}

function add_new_locations(res, cData, locations) {
	console.log('[add_new_locations]');
	if (locations && locations.add && locations.add.length) {
		var pingbacks = 0
			, data = locations.add
			;

		function _respond_() {
			if (pingbacks == data.length) {
				return remove_existing_locations(res, cData, locations);
			} else {
				console.log('still waiting for more.... ('+pingbacks+' == '+data.length+')');
			}
		}

		data.forEach(function(LOCATION, idx) {
			console.log('try to save, name: '+LOCATION.name);
			var lObj = new locModel(LOCATION);
			lObj.client_id = cData._id;
			lObj.save(function(err, ok) {
				if (err) {
					// throw an error????
					return res.status(500).send({ status: 'err', msg: 'failed to save location, name: ' + lObj.name, err: err });
				}
				pingbacks += 1;
				_respond_();
			});

		});
	} else {
		console.log('NO NEW ONES, carry on');
		return remove_existing_locations(res, cData, locations);
	}
}

function remove_existing_locations(res, cData, locations) {
	console.log('[remove_existing_locations]');
	if (locations && locations.remove && locations.remove.length) {
		var pingbacks = 0
			, data = locations.remove
			;

		function _respond_() {
			if (pingbacks == data.length) {
				get_client_and_respond(res, cData);
			} else {
				console.log('still waiting for more.... ('+pingbacks+' == '+data.length+')');
			}
		}

		data.forEach(function(LOCATION, idx) {
			if (!LOCATION || typeof (LOCATION) !== 'string') {
				//throw new Error('bad location data, cannot remove: ' + LOCATION);
				return res.status(500).send({ status: 'err', msg: 'bad location data, cannot remove, _id: ' + LOCATION });
			}
			console.log('try to remove, _id: '+LOCATION);
			lObj.remove({ _id: LOCATION }, function(err, ok) {
				if (err) {
					// throw an error????
					return res.status(500).send({ status: 'err', msg: 'failed to remove location, _id: ' + LOCATION, err: err });
				}
				pingbacks += 1;
				_respond_();
			});

		});
	} else {
		console.log('NO REMOVE ONES, carry on');
		get_client_and_respond(res, cData);
	}
}

function get_client_and_respond(res, cData) {
	console.log('[get_client_and_respond]');
	clientModel.findOne({ _id: cData._id }, function(err, CLIENT) {
		if (err) {
			return res.status(500).send({ status: 'err', msg: 'cannot retrieve client after save/update', error: err });
		}
		CLIENT = JSON.parse(JSON.stringify(CLIENT));
		locModel.find({ client_id: CLIENT._id }, function(err, locations) {
			// err? nah
			if (locations) CLIENT.locations = locations;
			return res.send({ status: 'ok', data: CLIENT });
		});
	});
}