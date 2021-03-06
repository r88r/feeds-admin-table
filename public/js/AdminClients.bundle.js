webpackJsonp([5],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, EditClient = __webpack_require__(4)
		, ListClients = __webpack_require__(5)
		, Controls = __webpack_require__(6)
		, KF = __webpack_require__(9);
		;

	var AdminClients = React.createClass({displayName: "AdminClients",
		
		getInitialState: function() {
			var _ID_ = KF.getGetVar('id');
			return {
				edit_client_id: _ID_ || false,
				render_state: _ID_ ? 'edit-client' : 'list-clients'
			}
		},
		
		// this click handler is part of a stand-in for React Router
		handleClick: function(from, e) {
			if (e) e.preventDefault();
			this.setState({ render_state: from });
		},
		
		handleClientClick: function(id) {
			this.setState({
				edit_client_id: id,
				render_state: 'edit-client'
			});
		},
		
		componentDidMount: function() {

		},

		render: function(){

			switch (this.state.render_state) {
				case 'list-clients':
				default:
					var render_handler = ( React.createElement(ListClients, {handleClientClick: this.handleClientClick}) );
					break;
				
				case 'new-client':
				case 'edit-client':
					
					// NOTE: "routeBackToList" is a stand-in till we get react-router properly wrapped in here.
					// basically, it is meant to be a way to trigger the app state to render the list again.
					
					var m_id = this.state.render_state == 'new-client' ? false : this.state.edit_client_id
						, render_handler = ( React.createElement(EditClient, {id: m_id, editOrAdd: m_id ? 'edit' : 'add', routeBackToList: this.handleClick.bind(null, 'list-clients')}) )
						;
					break;
			}
			
			return (
				React.createElement("div", null, 
					React.createElement("h1", null, "ZaZZZ AdminClients"), 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "large-2 medium-2 small-12 columns"}, 
							React.createElement(Controls, {handleClick: this.handleClick, 
								objectNamePlural: "Clients", objectNameSingle: "Client", 
								listRenderState: "list-clients", newRenderState: "new-client"}
								)
						), 
						React.createElement("div", {className: "large-10 medium-10 small-12 columns"}, 
							render_handler
						)
					)
				)
			);
		}
	});

	React.render(
	  React.createElement(AdminClients, null),
	  document.getElementById('app')
	);


/***/ },

/***/ 4:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, AdminStore = __webpack_require__(8)
		, MachineActions = __webpack_require__(23) // setMachineName() << shared because client can do this too
		, ClientActions = __webpack_require__(24) // saveClient() << shared because client can do this too
		, ClientLocation = __webpack_require__(25)

		, FormMagic = __webpack_require__(26)
		;

	var EditClient = React.createClass({displayName: "EditClient",
		
		getInitialState: function() {

			window.cState = this.state;

			return {
				clientObj: {},
				checkedOnce: false,
				edited: false,
				client_id: this.props.id,
				editOrAdd: this.props.editOrAdd
			}
		},
		
		returnBack: function(e) {
			if (e) e.preventDefault();
			// could also put some logic here, for instance if form has info, ask first.
			this.props.routeBackToList();
		},
		
		componentDidMount: function() {
			this.setState({
				clientObj: this.getClientObj(),
				checkedOnce: true
			});
			AdminStore.addClientChangeListener(this._onAdminChange);
		},

		componentWillUnmount: function() {
			//MachineStore.removeChangeListener(this._onMachineChange);
			AdminStore.removeClientChangeListener(this._onAdminChange);
		},
		
		componentWillReceiveProps: function(props) {
			stateParams = {
				editOrAdd: props.editOrAdd
			}
			if (props.editOrAdd == 'add') {
				stateParams.clientObj = {};
				stateParams.checkedOnce = false;
				stateParams.edited = false;
				stateParams.client_id = null;
			} else {
				stateParams.client_id = props.id;
			}
			
			//console.log(' EDIT state check [1], machine_id: '+stateParams.machine_id);
			this.setState(stateParams);
		},

		_onAdminChange: function() {
			var C = this.getClientObj();
			if (C.justSaved) {
				// probably should be doing this through actions, no?
				AdminStore.unmarkSavedClient(C._id);
				this.returnBack();

			} else {
				this.setState({ clientObj: C });
			}
		},
		
		getClientObjAgain: function() {
			this.getClientObj(true);
		},
		
		getClientObj: function(again) {
			again = again || false;
			//console.log(' EDIT state check [2], machine_id: '+this.state.machine_id);
			var obj = AdminStore.getClientById(this.state.client_id, !again ? this.getClientObjAgain : null);
			if (!obj) {
				obj = {};
			//} else {
				// disconnect from store reference: (wonder if this is best practice???)
				//obj = JSON.parse( JSON.stringify(obj) );
			}
			return obj;
		},
		
	/* custom form event handlers */
		handleSubmit: function(e) {
			e.preventDefault();
			this.setState({
				client_id: this.state.clientObj._id
			})
			ClientActions.saveClient(this.state.clientObj);
		},
		
		// proxy is used to provide any custom handling for the Edit element, before doing a state update or data-path update
		// (or simply some other type of reaction depending on form field)
		// ALSO!!:::: need to pass in the sub-root of the state (clientObj) to where the form updates should be applied to
		updateStateProxy: function(e, path) {
			var node = e.target;
			//this._updateState(node.getAttribute('data-path'), node.value);
			
			//console.log('[updateStateProxy], path: ' + path + ' (should be undefined) ... value: ' + node.value + ', checked? '+node.checked + ', type: '+node.type);
			//console.dir(e);
			//console.dir(node);
			
			/// FIXME: needs work, handling the checkbox clicked state vs. the checkbox value for Boolean vars (enabled? true|false as value AND checked!);
			/*
			if (node.type == 'checkbox') {
				
				if (['true','false',true,false].indexOf(node.value) > -1) {
				
				} else {
					
				}
				
				var val = node.checked ? node.value : '';
				if (node.value == 'true') {
					val = node.checked ? true : false;
				}
			} else {
				var val = node.value;
			}
			*/
			// for now, easy handler because all checkboxes are booleans....
			var val = node.type == 'checkbox' && (node.getAttribute('data-boolfield') == 'true' || node.getAttribute('data-boolfield') == true)
				? node.checked : node.value;
			
			FormMagic.updateDataPathState.call(this, path || node.getAttribute('data-path'), val, 'clientObj');
		},

		render: function() {
			
			if (this.state.editOrAdd == 'edit') {
				
				if (!this.state.clientObj && !this.state.checkedOnce) {

					return (
						React.createElement("p", null, "loading client data, one moment")
					);
				
				} else {
					return this.form_output();
				}

			} else {
			
				return this.form_output();
			}
			
		},
		
		addLocation: function(e) {
			e.preventDefault();
			var cObj = this.state.clientObj;
			if (!cObj.locations) {
				cObj.locations = [];
			}
			cObj.locations.push({}); // empty location
			this.setState({ clientObj: cObj });
		},
		
		updateLocationData: function(idx, path, value) {

			var cObj = this.state.clientObj;
			if (cObj.locations[idx]) {
				
				if (path !== null) {
					cObj.locations[idx] = FormMagic.updateDataPathState.call(cObj.locations[idx], path, value);
				} else  {
					cObj.locations.splice(idx, 1);
				}

				this.setState({ clientObj: cObj });

			} else {
				console.error('tried to update Location data, but undefined index was passed: '+idx);
			}
		},
		
		form_output: function() {
			//console.log(' EDIT state check [4], client_id: '+this.state.clientObj.client_id);
			
			// s/b a <Location /> handler!
			var $LOCATIONS = this.state.clientObj && this.state.clientObj.locations ? this.state.clientObj.locations.map(function(L, idx) {
				return (
					React.createElement("li", {key: idx}, React.createElement(ClientLocation, {locationIndex: idx, data: L, updateLocationParent: this.updateLocationData}))
				);
			}.bind(this)) : false;

			return (
				React.createElement("div", {className: "row"}, 
					React.createElement("h2", null, this.state.editOrAdd == 'edit' ? 'Edit a' : 'Add a new', " Client"), 
					React.createElement("form", {action: "", method: "post", onSubmit: this.handleSubmit}, 

						React.createElement("h4", null, "General Info"), 

						FormMagic.renderTextInput.call(this, 'name', 'Business Name:', this.state.clientObj ? this.state.clientObj.name : null, null, this.updateStateProxy), 
						FormMagic.renderTextInput.call(this, 'email', 'Email:', this.state.clientObj ? this.state.clientObj.email : null, null, this.updateStateProxy), 
						FormMagic.renderTextInput.call(this, 'phone', 'Phone:', this.state.clientObj ? this.state.clientObj.phone : null, null, this.updateStateProxy), 
						FormMagic.renderTextInput.call(this, 'website', 'Website:', this.state.clientObj ? this.state.clientObj.website : null, null, this.updateStateProxy), 

						FormMagic.renderBooleanCheckboxInput.call(this, 'enabled', 'Enabled?', this.state.clientObj && this.state.clientObj.enabled ? true : false, null, this.updateStateProxy), 

						React.createElement("hr", null), 
						React.createElement("h4", null, "Locations"), 
						
						React.createElement("ul", {className: "block-grid-2"}, 
							$LOCATIONS
						), 

						React.createElement("div", {className: "large-4 columns"}, " "), 
						React.createElement("div", {className: "large-8 columns"}, 
							React.createElement("button", {className: "button tiny", onClick: this.addLocation}, "+ Add Location"), ' ', ' ', ' ', React.createElement("button", {className: "button tiny", onClick: this.handleSubmit}, "Save"), ' ', React.createElement("button", {className: "button tiny", onClick: this.returnBack}, "Cancel")
						), 
						React.createElement("div", {className: "clearfix"})

					)
				)
			);
		}
		
	});

	module.exports = EditClient;

/***/ },

/***/ 5:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, Griddle = __webpack_require__(14)
		, AdminStore = __webpack_require__(8)

		, ClientActions = __webpack_require__(24)
		, AdminActions = __webpack_require__(7)

		, MachineLink = __webpack_require__(27)
		, ClientLink = __webpack_require__(28)
		, EmailLink = __webpack_require__(29)
		, WebLink = __webpack_require__(30)
		, LocationLink = __webpack_require__(31)
		;


	var ListClients = React.createClass({displayName: "ListClients",
		
		getInitialState: function() {
			return {}
		},
		
		componentDidMount: function() {
			AdminStore.addClientChangeListener(this._onAdminChange);
			AdminActions.getClients();
		},

		componentWillUnmount: function() {
			AdminStore.removeClientChangeListener(this._onAdminChange);
		},
		
		_onAdminChange: function() {
			this.setState({
				clients: AdminStore.getClientList()
			});
		},

		render: function() {
			
			if (this.state.clients && this.state.clients.length) {

				var gData = JSON.parse(JSON.stringify(this.state.clients))
					;
				
				gData.forEach(function(C) {
					// passing in the right prop handler
					C.handleClientClick = this.props.handleClientClick;
					C.enabled = C.enabled ? 'yes' : 'no';
					C.num_locations = C.locations.length;
					C.num_machines = 0;
					C.locations.forEach(function(L) {
						C.num_machines += L.machine_ids.length;
					});
					C.client_link_prefix = '/admin/clients?id=';
				}.bind(this));
				
				var gColumns = [ '_id',
					'phone',
					'email',
					'website',
					'num_locations',
					'num_machines',
					]
					, griddleMeta = [
						  { columnName: '_id', displayName: 'Client', customComponent: ClientLink },
						  { columnName: 'phone', displayName: 'Phone' },
						  { columnName: 'email', displayName: 'Main Email', customComponent: EmailLink },
						  { columnName: 'website', displayName: 'Website', customComponent: WebLink },
						  { columnName: 'num_locations', displayName: 'Locations?' },
						  { columnName: 'num_machines', displayName: 'Machines?' },
					]
					, perPage = gData.length > 40 ? gData.length/4 : gData.length
					, showPager = gData.length == perPage ? false : true
					;

				// there's a bug in griddle that makes react puke up if showPager is toggled on and off dynamically
				showPager = false;
				// just show all on one page for now: (pager looks like crap in ZURB)
				perPage = gData.length;

				return (
					React.createElement("div", null, 
						React.createElement(Griddle, {resultsPerPage: perPage, showPager: showPager, results: gData, tableClassName: "table", columnMetadata: griddleMeta, columns: gColumns})
					)
				);

			} else {
				
				return (
					React.createElement("p", null, 
						this.state.hasOwnProperty('clients') ? 'no clients found!' : 'loading clients, one moment please'
					)
				);
				
			}
		}
		
	});

	module.exports = ListClients;

/***/ },

/***/ 6:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13);

	var Controls = React.createClass({displayName: "Controls",
		
		/* should add the requiredProps : function() to make sure that we get the props needed in render */

		getInitialState: function() {
			return {}
		},
		
		render: function() {
			
			return (
				React.createElement("p", null, 
					React.createElement("button", {className: "button tiny radius", onClick: this.props.handleClick.bind(null, this.props.listRenderState)}, "List ", this.props.objectNamePlural), 
					React.createElement("button", {className: "button tiny radius", onClick: this.props.handleClick.bind(null, this.props.newRenderState)}, "+ ", this.props.objectNameSingle)
				)
			);
		}
		
	});

	module.exports = Controls;

/***/ },

/***/ 7:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(33)
		, appConstants = __webpack_require__(34)
		, AdminAPI = __webpack_require__(36)
		;

	var AdminActions = {

		getClients: function() {
			AdminAPI.getClients(this.receiveClientList.bind(this));
		},

		getUsers: function() {
			AdminAPI.getAdminUsers(this.receiveUserList.bind(this));
		},

		receiveUserList: function(err, data) {
			if (err) {
				console.error('[receiveClientList] err! '+err);
			} else {
				console.log('[AdminActions] receiveClientList... fire action: ' + appConstants.LOAD_CLIENT_LIST);
				AppDispatcher.handleServerAction({
					actionType: appConstants.LOAD_USER_LIST,
					data: data
				});
			}
		},
		
		receiveClientList: function(err, data) {
			if (err) {
				console.error('[receiveClientList] err! '+err);
			} else {
				console.log('[AdminActions] receiveClientList... fire action: ' + appConstants.LOAD_CLIENT_LIST);
				AppDispatcher.handleServerAction({
					actionType: appConstants.LOAD_CLIENT_LIST,
					data: data
				});
			}
		},
		
	//*
	//Store methods, right?: actually, no, GET_* are Store actions, not NEW_*
		newClient: function(data) {
			AppDispatcher.handleViewAction({
				actionType: appConstants.NEW_CLIENT,
				data: data
			});
		},
		
		newMachine: function() {
			AppDispatcher.handleViewAction({
				actionType: appConstants.NEW_MACHINE,
				data: null
			});
		},
	//*/
	/*
	// proposed, but not used:
		removeMachine: function(machine_id) {
			AppDispatcher.handleServerAction({
				actionType: appConstants.REMOVE_MACHINE,
				data: machine_id
			});
		},

		loadClients: function(data) {
			AppDispatcher.handleServerAction({
				actionType: appConstants.LOAD_CLIENT_LIST,
				data: data
			});
		},
		
		loadMachines: function() {
			AppDispatcher.handleServerAction({
				actionType: appConstants.LOAD_MACHINES,
				data: null
			});
		},
	*/
	};

	module.exports = AdminActions;

/***/ },

/***/ 8:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(33)
		, appConstants = __webpack_require__(34)
		, objectAssign = __webpack_require__(35)
		, EventEmitter = __webpack_require__(37).EventEmitter
		, CLIENT_CHANGE_EVENT = 'clients_change'
		, USER_CHANGE_EVENT = 'users_change'
		, ClientActions = __webpack_require__(24)

	// state vars:
		, _store = {
			machines: {
				list: []
			},
			clients: {
				list: []
			}
		}
		, current_client_id = null // admin property mainly
		, list_loaded_once = false

		;

	var adminStore = objectAssign({}, EventEmitter.prototype);

	adminStore = objectAssign(adminStore, {
		addChangeListener: function(kind, cb){
			this.on(kind, cb);
		},

		removeChangeListener: function(kind, cb){
			this.removeListener(kind, cb);
		},
		
		emitChange: function(kind) {
			this.emit(kind);
		},
	});

	/****************** clients *****/

	var setClientList = function(data) {
		list_loaded_once = true;
		_store.clients.list = data;
	};

	var setCurrentClientId = function(id) {
		_store.clients.current_client_id = id;
	}

	var addClient = function(data) {
		var idx = false;
		
		_store.clients.list.forEach(function(ITEM, x) { if (ITEM._id == data._id) { idx = x } });
		
		if (idx !== false) {
			_store.clients.list[idx] = data;
		} else {
			_store.clients.list.push(data);
		}
	};

	var setClientOwnerId = function(user_id, data) {
		var idx = false;
		list.forEach(function(ITEM, x) { if (ITEM._id == data._id) { idx = x } });
		
		if (idx !== false) {
			list[idx].owner = data;
			return true;
		}
		return false;
	}

	adminStore = objectAssign(adminStore, {
		addClientChangeListener: function(cb){
			this.addChangeListener(CLIENT_CHANGE_EVENT, cb);
		},

		removeClientChangeListener: function(cb){
			this.removeChangeListener(CLIENT_CHANGE_EVENT, cb);
		},
		
		emitClientChange: function() {
			this.emit(CLIENT_CHANGE_EVENT);
		},
		
		unmarkSavedClient: function(_id) {
			var M = this.getClientById(_id);
			if (M) {
				delete M.justSaved;
				addClient(M);
			}
		},
		
		getClientList: function() {
			return _store.clients.list;
		},

		getCurrentClient: function(){
			var idx = false;
			_store.clients.list.forEach(function(ITEM, x) { if (ITEM._id == _store.clients.current_client_id) { idx = x } });
			return x ? _store.clients.list[x] : null;
		},
		
		getClientById: function(id, cb) {
			return adminStore.getClient({ _id: id }, cb);
		},
		
		// can match on any property now, but only matching on _id will trigger an API call if we haven't done that yet
		getClient: function(params, cb) {
			var idx = false
				, okeys = Object.keys(params)
				;
				
			if (okeys.length > 1) {
				console.error('too many params to match client with');
				return null;
			}
			
			if (params[okeys[0]]) {
			
				_store.clients.list.forEach(function(ITEM, x) {
					if (ITEM[okeys[0]] == params[okeys[0]]) { idx = x }
				});
				var result = idx !== false ? _store.clients.list[idx] : null;
				if (okeys[0] == '_id' && idx === false && !list_loaded_once && cb && typeof (cb) == 'function') {
					ClientActions.getClientById(params[okeys[0]], cb);
				}
				return result;
			}

			return null;
		},
		
		getClientLocation: function(id, loc_id) {
			var client = adminStore.getClientById(id);
			if (client && client.locations && client.locations.length) {
				var location = client.locations.filter(function(LOC) {
					return LOC._id == loc_id;
				});
				if (location && location.length) { return location.pop() }
			}
			return false;
		}

	});



	/****************** users *****/

	var setUserList = function(data) {
		list_loaded_once = true;
		_store.users.list = data;
	};

	var setCurrentUserId = function(id) {
		_store.users.current_user_id = id;
	}

	var addUser = function(data) {
		var idx = false;
		
		_store.users.list.forEach(function(ITEM, x) { if (ITEM._id == data._id) { idx = x } });
		
		if (idx !== false) {
			_store.users.list[idx] = data;
		} else {
			_store.users.list.push(data);
		}
	};

	adminStore = objectAssign(adminStore, {
		addUserChangeListener: function(cb){
			this.addChangeListener(USER_CHANGE_EVENT, cb);
		},

		removeUserChangeListener: function(cb){
			this.removeChangeListener(USER_CHANGE_EVENT, cb);
		},
		
		emitUserChange: function() {
			this.emit(USER_CHANGE_EVENT);
		},
		
		unmarkSavedUser: function(_id) {
			var M = this.getUserById(_id);
			if (M) {
				delete M.justSaved;
				addUser(M);
			}
		},
		
		getUserList: function() {
			return _store.users.list;
		},

		getCurrentUser: function(){
			var idx = false;
			_store.users.list.forEach(function(ITEM, x) { if (ITEM._id == _store.users.current_user_id) { idx = x } });
			return x ? _store.users.list[x] : null;
		},
		
		getUserById: function(id, cb) {
			return adminStore.getUser({ _id: id }, cb);
		},
		
		// can match on any property now, but only matching on _id will trigger an API call if we haven't done that yet
		getUser: function(params, cb) {
			var idx = false
				, okeys = Object.keys(params)
				;
				
			if (okeys.length > 1) {
				console.error('too many params to match user with');
				return null;
			}
			
			if (params[okeys[0]]) {
			
				_store.users.list.forEach(function(ITEM, x) {
					if (ITEM[okeys[0]] == params[okeys[0]]) { idx = x }
				});
				var result = idx !== false ? _store.users.list[idx] : null;
				if (okeys[0] == '_id' && idx === false && !list_loaded_once && cb && typeof (cb) == 'function') {
					UserActions.getUserById(params[okeys[0]], cb);
				}
				return result;
			}

			return null;
		},
		
		getUserLocation: function(id, loc_id) {
			var user = adminStore.getUserById(id);
			if (user && user.locations && user.locations.length) {
				var location = user.locations.filter(function(LOC) {
					return LOC._id == loc_id;
				});
				if (location && location.length) { return location.pop() }
			}
			return false;
		}

	});





	/*** actions dispatcher ***/
	adminStore.dispatch = AppDispatcher.register(function(payload){
		var action = payload.action;
		
		switch(action.actionType) {

			case appConstants.LOAD_CLIENT_LIST:
				console.log('[adminStore] LOAD_CLIENT_LIST ... action.data?');
				//console.dir(action.data);
				if (action.data.data) {
					setClientList(action.data.data);
				} else if (action.data.localCache) {
					setClientList(action.data.localCache);
				} else {
					setClientList([]);
				}
				adminStore.emitClientChange();
				break;

			case appConstants.CLIENT_SAVED:
				console.log('[AdminStore] CLIENT_SAVED');
				if (action.data.status == 'ok') {
					if (action.data.data) {
						action.data.data.justSaved = true;
						addClient(action.data.data);
						adminStore.emitClientChange();
					}
				} else {
					console.error('[CLIENT_SAVED] status returned was not ok!');
				}
				break;
			
			case appConstants.CLIENT_RETRIEVED:
				console.log('[adminStore] CLIENT_RETRIEVED');// ... action.data?');
				//console.dir(action.data);
				if (action.data.status == 'ok') {
					if (action.data.data) {
						addClient(action.data.data);
						adminStore.emitClientChange();
					}
				}
				break;

			case appConstants.LOAD_USER_LIST:
				console.log('[adminStore] LOAD_CLIENT_LIST');// ... action.data?');
				//console.dir(action.data);
				if (action.data.data) {
					setUserList(action.data.data);
				} else if (action.data.localCache) {
					setUserList(action.data.localCache);
				} else {
					setUserList([]);
				}
				adminStore.emitUserChange();
				break;

			case appConstants.USER_RETRIEVED:
				console.log('[adminStore] USER_RETRIEVED');// ... action.data?');
				//console.dir(action.data);
				if (action.data.status == 'ok') {
					if (action.data.data) {
						addUser(action.data.data);
						adminStore.emitUserChange();
					}
				}
				break;

			default:
				return true;
				break;
		}
	});

	module.exports = adminStore;




/***/ },

/***/ 9:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

		getGetVar: function(key, default_) {
			if (default_==null) { default_=''; }
			key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
			var qs = regex.exec(window.location.href);
			if(qs == null) {
				//console.log('[getGetVar] '+key+', returning default!: ' + default_);
				return default_;
			} else {
				//console.log('[getGetVar] '+key+', returning val!: ' + decodeURIComponent(qs[1]));
				return decodeURIComponent(qs[1]);
			}
		},
		
		_encodeURIComponent: function(str) {
			str = encodeURIComponent(str);
			str = str.replace('(', '%28');
			str = str.replace(')', '%29');
			str = str.replace('|', '%7C');
			return str;
		}

	}

/***/ },

/***/ 14:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   Griddle - Simple Grid Component for React
	   https://github.com/DynamicTyped/Griddle
	   Copyright (c) 2014 Ryan Lanciaux | DynamicTyped

	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);
	var GridTable = __webpack_require__(38);
	var GridFilter = __webpack_require__(39);
	var GridPagination = __webpack_require__(40);
	var GridSettings = __webpack_require__(41);
	var GridNoData = __webpack_require__(42);
	var CustomRowComponentContainer = __webpack_require__(43);
	var CustomPaginationContainer = __webpack_require__(44);
	var ColumnProperties = __webpack_require__(45);
	var RowProperties = __webpack_require__(46);
	var _ = __webpack_require__(52);

	var Griddle = React.createClass({
	    displayName: "Griddle",
	    columnSettings: null,
	    rowSettings: null,
	    getDefaultProps: function () {
	        return {
	            columns: [],
	            columnMetadata: [],
	            rowMetadata: null,
	            resultsPerPage: 5,
	            results: [], // Used if all results are already loaded.
	            initialSort: "",
	            initialSortAscending: true,
	            gridClassName: "",
	            tableClassName: "",
	            customRowComponentClassName: "",
	            settingsText: "Settings",
	            filterPlaceholderText: "Filter Results",
	            nextText: "Next",
	            previousText: "Previous",
	            maxRowsText: "Rows per page",
	            enableCustomFormatText: "Enable Custom Formatting",
	            //this column will determine which column holds subgrid data
	            //it will be passed through with the data object but will not be rendered
	            childrenColumnName: "children",
	            //Any column in this list will be treated as metadata and will be passed through with the data but won't be rendered
	            metadataColumns: [],
	            showFilter: false,
	            showSettings: false,
	            useCustomRowComponent: false,
	            useCustomGridComponent: false,
	            useCustomPagerComponent: false,
	            useGriddleStyles: true,
	            useGriddleIcons: true,
	            customRowComponent: null,
	            customGridComponent: null,
	            customPagerComponent: {},
	            enableToggleCustom: false,
	            noDataMessage: "There is no data to display.",
	            noDataClassName: "griddle-nodata",
	            customNoDataComponent: null,
	            showTableHeading: true,
	            showPager: true,
	            useFixedHeader: false,
	            useExternal: false,
	            externalSetPage: null,
	            externalChangeSort: null,
	            externalSetFilter: null,
	            externalSetPageSize: null,
	            externalMaxPage: null,
	            externalCurrentPage: null,
	            externalSortColumn: null,
	            externalSortAscending: true,
	            externalLoadingComponent: null,
	            externalIsLoading: false,
	            enableInfiniteScroll: false,
	            bodyHeight: null,
	            paddingHeight: 5,
	            rowHeight: 25,
	            infiniteScrollLoadTreshold: 50,
	            useFixedLayout: true,
	            isSubGriddle: false,
	            enableSort: true,
	            /* css class names */
	            sortAscendingClassName: "sort-ascending",
	            sortDescendingClassName: "sort-descending",
	            parentRowCollapsedClassName: "parent-row",
	            parentRowExpandedClassName: "parent-row expanded",
	            settingsToggleClassName: "settings",
	            nextClassName: "griddle-next",
	            previousClassName: "griddle-previous",
	            headerStyles: {},
	            /* icon components */
	            sortAscendingComponent: " ▲",
	            sortDescendingComponent: " ▼",
	            parentRowCollapsedComponent: "▶",
	            parentRowExpandedComponent: "▼",
	            settingsIconComponent: "",
	            nextIconComponent: "",
	            previousIconComponent: ""
	        };
	    },
	    /* if we have a filter display the max page and results accordingly */
	    setFilter: function (filter) {
	        if (this.props.useExternal) {
	            this.props.externalSetFilter(filter);
	            return;
	        }

	        var that = this,
	            updatedState = {
	            page: 0,
	            filter: filter
	        };

	        // Obtain the state results.
	        updatedState.filteredResults = _.filter(this.props.results, function (item) {
	            var arr = _.values(item);
	            for (var i = 0; i < arr.length; i++) {
	                if ((arr[i] || "").toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
	                    return true;
	                }
	            }

	            return false;
	        });

	        // Update the max page.
	        updatedState.maxPage = that.getMaxPage(updatedState.filteredResults);

	        //if filter is null or undefined reset the filter.
	        if (_.isUndefined(filter) || _.isNull(filter) || _.isEmpty(filter)) {
	            updatedState.filter = filter;
	            updatedState.filteredResults = null;
	        }

	        // Set the state.
	        that.setState(updatedState);
	    },
	    setPageSize: function (size) {
	        if (this.props.useExternal) {
	            this.props.externalSetPageSize(size);
	            return;
	        }

	        //make this better.
	        this.props.resultsPerPage = size;
	        this.setMaxPage();
	    },
	    toggleColumnChooser: function () {
	        this.setState({
	            showColumnChooser: !this.state.showColumnChooser
	        });
	    },
	    toggleCustomComponent: function () {
	        if (this.state.customComponentType === "grid") {
	            this.setProps({
	                useCustomGridComponent: !this.props.useCustomGridComponent
	            });
	        } else if (this.state.customComponentType === "row") {
	            this.setProps({
	                useCustomRowComponent: !this.props.useCustomRowComponent
	            });
	        }
	    },
	    getMaxPage: function (results, totalResults) {
	        if (this.props.useExternal) {
	            return this.props.externalMaxPage;
	        }

	        if (!totalResults) {
	            totalResults = (results || this.getCurrentResults()).length;
	        }
	        var maxPage = Math.ceil(totalResults / this.props.resultsPerPage);
	        return maxPage;
	    },
	    setMaxPage: function (results) {
	        var maxPage = this.getMaxPage(results);
	        //re-render if we have new max page value
	        if (this.state.maxPage !== maxPage) {
	            this.setState({ page: 0, maxPage: maxPage, filteredColumns: this.columnSettings.filteredColumns });
	        }
	    },
	    setPage: function (number) {
	        if (this.props.useExternal) {
	            this.props.externalSetPage(number);
	            return;
	        }

	        //check page size and move the filteredResults to pageSize * pageNumber
	        if (number * this.props.resultsPerPage <= this.props.resultsPerPage * this.state.maxPage) {
	            var that = this,
	                state = {
	                page: number
	            };

	            that.setState(state);
	        }
	    },
	    setColumns: function (columns) {
	        this.columnSettings.filteredColumns = _.isArray(columns) ? columns : [columns];

	        this.setState({
	            filteredColumns: this.columnSettings.filteredColumns
	        });
	    },
	    nextPage: function () {
	        var currentPage = this.getCurrentPage();
	        if (currentPage < this.getCurrentMaxPage() - 1) {
	            this.setPage(currentPage + 1);
	        }
	    },
	    previousPage: function () {
	        var currentPage = this.getCurrentPage();
	        if (currentPage > 0) {
	            this.setPage(currentPage - 1);
	        }
	    },
	    changeSort: function (sort) {
	        if (this.props.enableSort === false) {
	            return;
	        }
	        if (this.props.useExternal) {
	            this.props.externalChangeSort(sort, this.props.externalSortColumn === sort ? !this.props.externalSortAscending : true);
	            return;
	        }

	        var that = this,
	            state = {
	            page: 0,
	            sortColumn: sort,
	            sortAscending: true
	        };

	        // If this is the same column, reverse the sort.
	        if (this.state.sortColumn == sort) {
	            state.sortAscending = !this.state.sortAscending;
	        }

	        this.setState(state);
	    },
	    componentWillReceiveProps: function (nextProps) {
	        this.setMaxPage(nextProps.results);
	    },
	    getInitialState: function () {
	        var state = {
	            maxPage: 0,
	            page: 0,
	            filteredResults: null,
	            filteredColumns: [],
	            filter: "",
	            sortColumn: this.props.initialSort,
	            sortAscending: this.props.initialSortAscending,
	            showColumnChooser: false
	        };

	        return state;
	    },
	    componentWillMount: function () {
	        this.verifyExternal();
	        this.verifyCustom();

	        this.columnSettings = new ColumnProperties(this.props.results.length > 0 ? _.keys(this.props.results[0]) : [], this.props.columns, this.props.childrenColumnName, this.props.columnMetadata, this.props.metadataColumns);

	        this.rowSettings = new RowProperties(this.props.rowMetadata);

	        this.setMaxPage();

	        //don't like the magic strings
	        if (this.props.useCustomGridComponent === true) {
	            this.setState({
	                customComponentType: "grid"
	            });
	        } else if (this.props.useCustomRowComponent === true) {
	            this.setState({
	                customComponentType: "row"
	            });
	        } else {
	            this.setState({
	                filteredColumns: this.columnSettings.filteredColumns
	            });
	        }
	    },
	    //todo: clean these verify methods up
	    verifyExternal: function () {
	        if (this.props.useExternal === true) {
	            //hooray for big ugly nested if
	            if (this.props.externalSetPage === null) {
	                console.error("useExternal is set to true but there is no externalSetPage function specified.");
	            }

	            if (this.props.externalChangeSort === null) {
	                console.error("useExternal is set to true but there is no externalChangeSort function specified.");
	            }

	            if (this.props.externalSetFilter === null) {
	                console.error("useExternal is set to true but there is no externalSetFilter function specified.");
	            }

	            if (this.props.externalSetPageSize === null) {
	                console.error("useExternal is set to true but there is no externalSetPageSize function specified.");
	            }

	            if (this.props.externalMaxPage === null) {
	                console.error("useExternal is set to true but externalMaxPage is not set.");
	            }

	            if (this.props.externalCurrentPage === null) {
	                console.error("useExternal is set to true but externalCurrentPage is not set. Griddle will not page correctly without that property when using external data.");
	            }
	        }
	    },
	    verifyCustom: function () {
	        if (this.props.useCustomGridComponent === true && this.props.customGridComponent === null) {
	            console.error("useCustomGridComponent is set to true but no custom component was specified.");
	        }
	        if (this.props.useCustomRowComponent === true && this.props.customRowComponent === null) {
	            console.error("useCustomRowComponent is set to true but no custom component was specified.");
	        }
	        if (this.props.useCustomGridComponent === true && this.props.useCustomRowComponent === true) {
	            console.error("Cannot currently use both customGridComponent and customRowComponent.");
	        }
	    },
	    getDataForRender: function (data, cols, pageList) {
	        var that = this;
	        //get the correct page size
	        if (this.state.sortColumn !== "" || this.props.initialSort !== "") {
	            var sortProperty = _.where(this.props.columnMetadata, { columnName: this.state.sortColumn });
	            sortProperty = sortProperty.length > 0 && sortProperty[0].hasOwnProperty("sortProperty") && sortProperty[0].sortProperty || null;

	            data = _.sortBy(data, function (item) {
	                return sortProperty ? item[that.state.sortColumn || that.props.initialSort][sortProperty] : item[that.state.sortColumn || that.props.initialSort];
	            });

	            if (this.state.sortAscending === false) {
	                data.reverse();
	            }
	        }

	        var currentPage = this.getCurrentPage();

	        if (!this.props.useExternal && pageList && this.props.resultsPerPage * (currentPage + 1) <= this.props.resultsPerPage * this.state.maxPage && currentPage >= 0) {
	            if (this.isInfiniteScrollEnabled()) {
	                // If we're doing infinite scroll, grab all results up to the current page.
	                data = _.first(data, (currentPage + 1) * this.props.resultsPerPage);
	            } else {
	                //the 'rest' is grabbing the whole array from index on and the 'initial' is getting the first n results
	                var rest = _.rest(data, currentPage * this.props.resultsPerPage);
	                data = _.initial(rest, rest.length - this.props.resultsPerPage);
	            }
	        }

	        var meta = this.columnSettings.getMetadataColumns;

	        var transformedData = [];

	        for (var i = 0; i < data.length; i++) {
	            var mappedData = data[i];

	            if (typeof mappedData[that.props.childrenColumnName] !== "undefined" && mappedData[that.props.childrenColumnName].length > 0) {
	                //internally we're going to use children instead of whatever it is so we don't have to pass the custom name around
	                mappedData.children = that.getDataForRender(mappedData[that.props.childrenColumnName], cols, false);

	                if (that.props.childrenColumnName !== "children") {
	                    delete mappedData[that.props.childrenColumnName];
	                }
	            }

	            transformedData.push(mappedData);
	        }
	        return transformedData;
	    },
	    //this is the current results
	    getCurrentResults: function () {
	        return this.state.filteredResults || this.props.results;
	    },
	    getCurrentPage: function () {
	        return this.props.externalCurrentPage || this.state.page;
	    },
	    getCurrentSort: function () {
	        return this.props.useExternal ? this.props.externalSortColumn : this.state.sortColumn;
	    },
	    getCurrentSortAscending: function () {
	        return this.props.useExternal ? this.props.externalSortAscending : this.state.sortAscending;
	    },
	    getCurrentMaxPage: function () {
	        return this.props.useExternal ? this.props.externalMaxPage : this.state.maxPage;
	    },
	    //This takes the props relating to sort and puts them in one object
	    getSortObject: function () {
	        return {
	            enableSort: this.props.enableSort,
	            changeSort: this.changeSort,
	            sortColumn: this.getCurrentSort(),
	            sortAscending: this.getCurrentSortAscending(),
	            sortAscendingClassName: this.props.sortAscendingClassName,
	            sortDescendingClassName: this.props.sortDescendingClassName,
	            sortAscendingComponent: this.props.sortAscendingComponent,
	            sortDescendingComponent: this.props.sortDescendingComponent
	        };
	    },
	    isInfiniteScrollEnabled: function () {
	        // If a custom pager is included, don't allow for infinite scrolling.
	        if (this.props.useCustomPagerComponent) {
	            return false;
	        }

	        // Otherwise, send back the property.
	        return this.props.enableInfiniteScroll;
	    },
	    getClearFixStyles: function () {
	        return {
	            clear: "both",
	            display: "table",
	            width: "100%"
	        };
	    },
	    getSettingsStyles: function () {
	        return {
	            float: "left",
	            width: "50%",
	            textAlign: "right"
	        };
	    },
	    getFilterStyles: function () {
	        return {
	            float: "left",
	            width: "50%",
	            textAlign: "left",
	            color: "#222",
	            minHeight: "1px"
	        };
	    },
	    getFilter: function () {
	        return this.props.showFilter && this.props.useCustomGridComponent === false ? React.createElement(GridFilter, { changeFilter: this.setFilter, placeholderText: this.props.filterPlaceholderText }) : "";
	    },
	    getSettings: function () {
	        return this.props.showSettings ? React.createElement(
	            "button",
	            { type: "button", className: this.props.settingsToggleClassName, onClick: this.toggleColumnChooser,
	                style: this.props.useGriddleStyles ? { background: "none", border: "none", padding: 0, margin: 0, fontSize: 14 } : null },
	            this.props.settingsText,
	            this.props.settingsIconComponent
	        ) : "";
	    },
	    getTopSection: function (filter, settings) {
	        if (this.props.showFilter === false && this.props.showSettings === false) {
	            return "";
	        }

	        var filterStyles = null,
	            settingsStyles = null,
	            topContainerStyles = null;

	        if (this.props.useGriddleStyles) {
	            filterStyles = this.getFilterStyles();
	            settingsStyles = this.getSettingsStyles();

	            topContainerStyles = this.getClearFixStyles();
	        }

	        return React.createElement(
	            "div",
	            { className: "top-section", style: topContainerStyles },
	            React.createElement(
	                "div",
	                { className: "griddle-filter", style: filterStyles },
	                filter
	            ),
	            React.createElement(
	                "div",
	                { className: "griddle-settings-toggle", style: settingsStyles },
	                settings
	            )
	        );
	    },
	    getPagingSection: function (currentPage, maxPage) {
	        if ((this.props.showPager && !this.isInfiniteScrollEnabled() && !this.props.useCustomGridComponent) === false) {
	            return "";
	        }

	        return React.createElement(
	            "div",
	            { className: "griddle-footer" },
	            this.props.useCustomPagerComponent ? React.createElement(CustomPaginationContainer, { next: this.nextPage, previous: this.previousPage, currentPage: currentPage, maxPage: maxPage, setPage: this.setPage, nextText: this.props.nextText, previousText: this.props.previousText, customPagerComponent: this.props.customPagerComponent }) : React.createElement(GridPagination, { useGriddleStyles: this.props.useGriddleStyles, next: this.nextPage, previous: this.previousPage, nextClassName: this.props.nextClassName, nextIconComponent: this.props.nextIconComponent, previousClassName: this.props.previousClassName, previousIconComponent: this.props.previousIconComponent, currentPage: currentPage, maxPage: maxPage, setPage: this.setPage, nextText: this.props.nextText, previousText: this.props.previousText })
	        );
	    },
	    getColumnSelectorSection: function (keys, cols) {
	        return this.state.showColumnChooser ? React.createElement(GridSettings, { columns: keys, selectedColumns: cols, setColumns: this.setColumns, settingsText: this.props.settingsText,
	            settingsIconComponent: this.props.settingsIconComponent, maxRowsText: this.props.maxRowsText, setPageSize: this.setPageSize,
	            showSetPageSize: !this.props.useCustomGridComponent, resultsPerPage: this.props.resultsPerPage, enableToggleCustom: this.props.enableToggleCustom,
	            toggleCustomComponent: this.toggleCustomComponent, useCustomComponent: this.props.useCustomRowComponent || this.props.useCustomGridComponent,
	            useGriddleStyles: this.props.useGriddleStyles, enableCustomFormatText: this.props.enableCustomFormatText, columnMetadata: this.props.columnMetadata }) : "";
	    },
	    getCustomGridSection: function () {
	        return React.createElement(this.props.customGridComponent, { data: this.props.results, className: this.props.customGridComponentClassName });
	    },
	    getCustomRowSection: function (data, cols, meta, pagingContent) {
	        return React.createElement(
	            "div",
	            null,
	            React.createElement(CustomRowComponentContainer, { data: data, columns: cols, metadataColumns: meta,
	                className: this.props.customRowComponentClassName, customComponent: this.props.customRowComponent,
	                style: this.getClearFixStyles() }),
	            this.props.showPager && pagingContent
	        );
	    },
	    getStandardGridSection: function (data, cols, meta, pagingContent, hasMorePages) {
	        var sortProperties = this.getSortObject();

	        return React.createElement(
	            "div",
	            { className: "griddle-body" },
	            React.createElement(GridTable, { useGriddleStyles: this.props.useGriddleStyles,
	                columnSettings: this.columnSettings,
	                rowSettings: this.rowSettings,
	                sortSettings: sortProperties,
	                isSubGriddle: this.props.isSubGriddle,
	                useGriddleIcons: this.props.useGriddleIcons,
	                useFixedLayout: this.props.useFixedLayout,
	                showPager: this.props.showPager,
	                pagingContent: pagingContent,
	                data: data,
	                className: this.props.tableClassName,
	                enableInfiniteScroll: this.isInfiniteScrollEnabled(),
	                nextPage: this.nextPage,
	                showTableHeading: this.props.showTableHeading,
	                useFixedHeader: this.props.useFixedHeader,
	                parentRowCollapsedClassName: this.props.parentRowCollapsedClassName,
	                parentRowExpandedClassName: this.props.parentRowExpandedClassName,
	                parentRowCollapsedComponent: this.props.parentRowCollapsedComponent,
	                parentRowExpandedComponent: this.props.parentRowExpandedComponent,
	                bodyHeight: this.props.bodyHeight,
	                paddingHeight: this.props.paddingHeight,
	                rowHeight: this.props.rowHeight,
	                infiniteScrollLoadTreshold: this.props.infiniteScrollLoadTreshold,
	                externalLoadingComponent: this.props.externalLoadingComponent,
	                externalIsLoading: this.props.externalIsLoading,
	                hasMorePages: hasMorePages })
	        );
	    },
	    getContentSection: function (data, cols, meta, pagingContent, hasMorePages) {
	        if (this.props.useCustomGridComponent && this.props.customGridComponent !== null) {
	            return this.getCustomGridSection();
	        } else if (this.props.useCustomRowComponent) {
	            return this.getCustomRowSection(data, cols, meta, pagingContent);
	        } else {
	            return this.getStandardGridSection(data, cols, meta, pagingContent, hasMorePages);
	        }
	    },
	    getNoDataSection: function (gridClassName, topSection) {
	        var myReturn = null;
	        if (this.props.customNoDataComponent != null) {
	            myReturn = React.createElement(
	                "div",
	                { className: gridClassName },
	                React.createElement(this.props.customNoDataComponent, null)
	            );

	            return myReturn;
	        }

	        myReturn = React.createElement(
	            "div",
	            { className: gridClassName },
	            topSection,
	            React.createElement(GridNoData, { noDataMessage: this.props.noDataMessage })
	        );
	        return myReturn;
	    },
	    shouldShowNoDataSection: function (results) {
	        return this.props.useExternal === false && (typeof results === "undefined" || results.length === 0) || this.props.useExternal === true && this.props.externalIsLoading === false && results.length === 0;
	    },
	    render: function () {
	        var that = this,
	            results = this.getCurrentResults(); // Attempt to assign to the filtered results, if we have any.

	        var headerTableClassName = this.props.tableClassName + " table-header";

	        //figure out if we want to show the filter section
	        var filter = this.getFilter();
	        var settings = this.getSettings();

	        //if we have neither filter or settings don't need to render this stuff
	        var topSection = this.getTopSection(filter, settings);

	        var keys = [];
	        var cols = this.columnSettings.getColumns();

	        //figure out which columns are displayed and show only those
	        var data = this.getDataForRender(results, cols, true);

	        var meta = this.columnSettings.getMetadataColumns();

	        // Grab the column keys from the first results
	        keys = _.keys(_.omit(results[0], meta));

	        // Grab the current and max page values.
	        var currentPage = this.getCurrentPage();
	        var maxPage = this.getCurrentMaxPage();

	        // Determine if we need to enable infinite scrolling on the table.
	        var hasMorePages = currentPage + 1 < maxPage;

	        // Grab the paging content if it's to be displayed
	        var pagingContent = this.getPagingSection(currentPage, maxPage);

	        var resultContent = this.getContentSection(data, cols, meta, pagingContent, hasMorePages);

	        var columnSelector = this.getColumnSelectorSection(keys, cols);

	        var gridClassName = this.props.gridClassName.length > 0 ? "griddle " + this.props.gridClassName : "griddle";
	        //add custom to the class name so we can style it differently
	        gridClassName += this.props.useCustomRowComponent ? " griddle-custom" : "";

	        if (this.shouldShowNoDataSection(results)) {
	            gridClassName += this.props.noDataClassName && this.props.noDataClassName.length > 0 ? " " + this.props.noDataClassName : "";
	            return this.getNoDataSection(gridClassName, topSection);
	        }

	        return React.createElement(
	            "div",
	            { className: gridClassName },
	            topSection,
	            columnSelector,
	            React.createElement(
	                "div",
	                { className: "griddle-container", style: this.props.useGriddleStyles && !this.props.isSubGriddle ? { border: "1px solid #DDD" } : null },
	                resultContent
	            )
	        );
	    }
	});

	module.exports = Griddle;

/***/ },

/***/ 23:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(33)
		, appConstants = __webpack_require__(34)
		, MachineAPI = __webpack_require__(50)
		;

	var ZaZZZActions = {
		
		receiveMachineList: function(err, data) {

			if (err) {
				console.error('[receiveMachineList] err! '+err);
			} else {
				console.log('[ZaZZZActions] receiveMachineList... fire action: '+appConstants.LOAD_MACHINES);
				AppDispatcher.handleServerAction({
					actionType: appConstants.LOAD_MACHINES,
					data: data
				});
			}
		},

		getMachines: function() {
			MachineAPI.getMachines(this.receiveMachineList);
		},
		
		saveMachine: function(data) {
			MachineAPI.saveMachine(data, this.machineSaved.bind(this));
		},
		
		machineSaved: function(err, data) {
			if (err) {
				console.error('[machineSaved] err! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.MACHINE_SAVED,
					data: data
				});
			}
		}
	};

	module.exports = ZaZZZActions;


/***/ },

/***/ 24:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(33)
		, appConstants = __webpack_require__(34)
		, ClientAPI = __webpack_require__(51)
		;

	var ClientActions = {

		saveClient: function(data) {
			ClientAPI.saveClient(data, this.clientSaved.bind(this));
		},
		
		clientSaved: function(err, data) {
			console.log('[ClientActions] clientSaved()');
			if (err) {
				console.error('[clientSaved] err! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.CLIENT_SAVED,
					data: data
				});
			}
		},
		
		getClientById: function(id, cb) {
			ClientAPI.getClientById(id, this.clientRetrieved.bind(this));
		},
		
		clientRetrieved: function(err, data) {
			console.log('[ClientActions] clientRetrieved()');
			if (err) {
				console.error('[clientRetrieved] err! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.CLIENT_RETRIEVED,
					data: data
				});
			}
		},

	/*
		loadLocations: function(data) {
			AppDispatcher.handleServerAction({
				actionType: appConstants.LOAD_CLIENT_LOCATIONS,
				data: data
			});
		},

		loadMachines: function() {
			AppDispatcher.handleServerAction({
				actionType: appConstants.LOAD_CLIENT_VENDING_MACHINES,
				data: null
			});
		},
		
		loadUsers: function() {
			AppDispatcher.handleServerAction({
				actionType: appConstants.LOAD_CLIENT_USER_LIST,
				data: null
			});
		},
		
		newUser: function() {
			AppDispatcher.handleViewAction({
				actionType: appConstants.NEW_CLIENT_USER,
				data: null
			});
		},

		setOwner: function(user_id) {
			AppDispatcher.handleViewAction({
				actionType: appConstants.SET_CLIENT_OWNER,
				data: user_id
			});
		},
	*/	
	};

	module.exports = ClientActions;

	console.log('ok ClientAPI is required!');

/***/ },

/***/ 25:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, FormMagic = __webpack_require__(26)
		;

	var styles = {
		padding: '8px',
		borderRadius: '3px',
		border: '1px solid #999',
		boxShadow: '4px 4px 4px rgba(0,0,0,0.3)',
		backgroundColor: '#efefef'
	}

	var ClientLocation = React.createClass({displayName: "ClientLocation",
		
		/* should add the requiredProps : function() to make sure that we get the props needed in render */

		getInitialState: function() {
			return {
				data: this.props.data || {},
				timezones: [
					{ name: 'NST (UTC-03:30)', val: 'NST' }, // newfoundland (canada)
					{ name: 'AST (UTC-04:00)', val: 'AST' }, // atlantic (canada)
					{ name: 'EST (UTC-05:00)', val: 'EST' },
					{ name: 'CST (UTC-06:00)', val: 'CST' },
					{ name: 'MST (UTC-07:00)', val: 'MST' },
					{ name: 'PST (UTC-08:00)', val: 'PST' },
					{ name: 'AKST (UTC-09:00)', val: 'AKST' }, // alaska
					{ name: 'HST (UTC-10:00)', val: 'HST' }, // hawaii
				]
			}
		},
		
		componentDidUpdate: function() {

		},
		
		updateTimezone: function(e) {
			var tz = e.target.value;
			this.props.updateLocationParent(this.props.locationIndex, 'timezone', tz);
		},
		
		updateLocationData: function(e) {
			var TAR = e.target;
			this.props.updateLocationParent(this.props.locationIndex, TAR.getAttribute('data-path'), TAR.value);
		},
		
		removeLocation: function(e) {
			this.props.updateLocationParent(this.props.locationIndex, null);
		},
		
		renderTimezoneSelect: function(tz) {
			var style = { fontSize: '0.65em' }
			
			tz = tz || 'PST'; // "preset"
				
			var tzOpts = this.state.timezones.map(function(C, idx) {
				var _idx = idx; //'copt-' + idx;
				return (
					React.createElement("option", {key: _idx, value: C.val}, C.name)
				)
			});
			
			return FormMagic.renderField.call(this, 'timezone', 'Timezone:',
				React.createElement("select", {name: "timezone", value: tz, onChange: this.updateTimezone}, 
					tzOpts
				)
			);
				
		},
		
		render: function() {
			
			var D = this.props.data;
			
			return (
				React.createElement("div", {style: styles}, 
					FormMagic.renderTextInput.call(this, 'name', 'Location Name:', D.name, null, this.updateLocationData), 
					FormMagic.renderTextInput.call(this, 'address_line1', 'Address Line 1:', D.address_line1, null, this.updateLocationData), 
					FormMagic.renderTextInput.call(this, 'address_line2', 'Address Line 2:', D.address_line2, null, this.updateLocationData), 

					FormMagic.renderTextInput.call(this, 'city', 'City:', D.city, null, this.updateLocationData), 
					FormMagic.renderTextInput.call(this, 'state', 'State:', D.state, null, this.updateLocationData), 
					FormMagic.renderTextInput.call(this, 'zip', 'ZIP:', D.zip, null, this.updateLocationData), 

					FormMagic.renderTextInput.call(this, 'phone', 'Phone:', D.phone, null, this.updateLocationData), 
					FormMagic.renderTextInput.call(this, 'email', 'Email:', D.email, null, this.updateLocationData), 

					FormMagic.renderTextInput.call(this, 'defaultHourOpen', 'Time Open:', D.business ? D.business.defaultHourOpen : null, 'business.defaultHourOpen', this.updateLocationData), 
					FormMagic.renderTextInput.call(this, 'defaultHourClosed', 'Time Closed:', D.business ? D.business.defaultHourClosed : null, 'business.defaultHourClosed', this.updateLocationData), 
					this.renderTimezoneSelect(D.timezone), 
					
					React.createElement("button", {className: "button tiny alert radius", onClick: this.removeLocation}, "Remove this location")
				)
			);
		}
	//				{FormMagic.renderTextInput.call(this, 'timezone', 'Timezone:', this.state.data ? this.state.data.timezone : null)}

	});

	module.exports = ClientLocation;

/***/ },

/***/ 26:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)

		, debug = false
		
		, _renderField = function(name, label, field) {
			return (
				React.createElement("div", null, 
					React.createElement("div", {className: "large-4 columns"}, 
						React.createElement("label", {htmlFor: name, className: "inline right"}, label)
					), 
					React.createElement("div", {className: "large-8 columns"}, 
						field
					), 
					React.createElement("div", {className: "clearfix"})
				)
			);
		}
		;

	function handleGenericChange(cb, e) {
		if (cb) { return cb(e); }
		else {
			var node = e.target
				, params = {}
				;
			params[node.name] = node.value;

			console.warn('no callback given for form field change event, blindly updating state based on "name" = '+node.name);

			this.setState(params);
		}
	}

	function handleRadioClick(cb, e) {
		console.log('[handleRadioClick]');
		console.dir(e);
		return handleGenericChange.call(this, cb, e);
	}

	function handleCheckboxClick(cb, e) {
		console.log('[handleCheckboxClick]');
		console.dir(e);
		return handleGenericChange.call(this, cb, e);
	}

	function handleTextInputChange(cb, e) {
		return handleGenericChange.call(this, cb, e);
	}

		

	module.exports = {

		setDebug: function(db) {
			debug = (db); // "(truthy)"
		},
		
		// exposes above function to export module for external calling
		// (necessary for custom field render methods not in this package)
		renderField: function(name, label, field) {
			return _renderField(name, label, field);
		},
		
		/// GIANT DEV NOTE: this approach so far only works on objects, fails on arrays.
		/// updating an array will require some serious other handling
		/// (at least an index reference to get the right object)
		/// PROBABLY fixed by detecting an array or something??? dunno yet.

		// stateNest USAGE: to allow applying state updates to a nested dictionary within this.state

		updateDataPathState: function(path, value, stateNest) {

	//		console.log('[FormMagic] updateDataPathState ....');

			//var STATE = this.state
			var STATE = this.setState ? this.state : this
				, parts = path.split('.')
				, ref
				, propname
				, stateRoot = stateNest ? STATE[stateNest] : STATE
				;
	/*
			console.log('.... this: ' + JSON.stringify(this));
			console.log('.... path: ' + path);
			console.log('.... value: ' + value);
			console.log('.... STATE: ' + JSON.stringify(STATE));
			console.log('.... stateNest: ' + stateNest);
			console.log('.... stateRoot: ' + JSON.stringify(stateRoot));
	//*/
			if (!stateRoot) { throw new Error('cannot update path in state, no (g)root!'); }

			while (parts.length > 1) {
				propname = parts.shift();
				ref = ref !== undefined ? ref[propname] : stateRoot[propname];
				if (ref === undefined && stateRoot[propname] == undefined) {
					stateRoot[propname] = {};
					ref = stateRoot[propname];
				}
			}

			propname = parts.shift();
			if (ref === undefined) { ref = stateRoot }

	//		console.log('.... ref: ' + JSON.stringify(ref));

			ref[propname] = value;

			// allow to be used with plain objects....
			if (this.setState !== undefined) {
	//			console.log('.... setting state');
				STATE.edited = true;
				this.setState(STATE);
			} else {
	//			console.log('.... returning state:');
	//			console.log( JSON.stringify(STATE) );
				return STATE;
			}
		},
		
		renderRadioInputs: function(name, label, value, options, path, cb) {
			if (debug) {
				console.log('[renderRadioInputs] field: '+name);
			}
			path = path || name;
			var radios = options.map(function(O, idx) {
				var checked = O == value ? true : false
					, KEY = idx + '-' + name
					;
				return (
					React.createElement("span", {key: KEY}, 
						React.createElement("input", {type: "radio", name: name, value: O, checked: checked, "data-path": path, onChange: handleRadioClick.bind(this, cb)}), " ", O, ' '
					)
				);
			}.bind(this));
			return _renderField(name, label, radios);
		},
		
		renderBooleanCheckboxInput: function(name, label, checked, path, cb) {
			if (debug) {
				console.log('[renderBooleanCheckboxInput] field: '+name+', value: '+value);
			}
			path = path || name;
			return _renderField(name, label,
				React.createElement("input", {type: "checkbox", name: name, ref: name, "data-boolfield": true, "data-path": path, checked: checked, onChange: handleCheckboxClick.bind(this, cb)})
			);
		},

		renderCheckboxInput: function(name, label, value, checked, path, cb) {
			throw new Error('regular checkbox not supported yet! (as in checkboxes that have non-boolean values');
			/*
			if (debug) {
				console.log('[renderCheckboxInput] field: '+name+', value: '+value);
			}
			path = path || name;
			return _renderField(name, label,
				<input type="checkbox" name={name} ref={name} data-path={path} checked={checked} onChange={handleCheckboxClick.bind(this, cb)} />
			);
			*/
		},

		renderTextInput: function(name, label, value, path, cb) {
			if (debug) {
				console.log('[renderTextInput] field: '+name);
			}
			value = value || null;
			path = path || name;
			return _renderField(name, label,
				React.createElement("input", {type: "text", name: name, ref: name, "data-path": path, value: value, onChange: handleTextInputChange.bind(this, cb)})
			);
		},

	}

/***/ },

/***/ 27:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13);

	var AdminMachineLink = React.createClass({displayName: "AdminMachineLink",
		
		getDefaultProps: function() {
			return {
				link_prefix: "/admin/zazzz/"
			}
		},
		
		handleClick: function(e) {
			e.preventDefault();
			//console.log('hallo from '+this.props.data+', '+this.props.rowData._id);
			this.props.rowData.handleMachineClick(this.props.data);
		},
		
		render: function() {
			var link = this.props.link_prefix + this.props.data
				, name = this.props.rowData.label || this.props.data
				, extra
				, style = { fontSize: '0.65em' } // text size for machine_id, if name is present
				;

			if (this.props.rowData.label) {
				extra = (
					React.createElement("em", {style: style}, " ", this.props.data)
				);
			}
			return (
				React.createElement("span", null, 
					React.createElement("a", {href: link, onClick: this.handleClick}, name), 
					extra
				)
			);
		}
		
	});

	module.exports = AdminMachineLink;

/***/ },

/***/ 28:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, AdminStore = __webpack_require__(8)
		;

	var AdminClientLink = React.createClass({displayName: "AdminClientLink",
		
		getDefaultProps: function() {
			return {
				link_prefix: "/admin/clients/"
			}
		},
		
		getInitialState: function() { return { client: false } },

		handleClick: function(e) {
			if (this.props.rowData.handleClientClick) {
				e.preventDefault();
				this.props.rowData.handleClientClick(this.props.data);
			}
		},
		
		componentDidMount: function() {
			if (this.props.data) {
				this.setState({
					client: AdminStore.getClientById(this.props.data)
				});
			}
		},
		
		render: function() {
			var prefix = this.props.rowData.client_link_prefix || this.props.link_prefix
				, link = prefix + this.props.data
				, extra
				, name
				, style = { fontSize: '0.35em' }
				;
			if (this.state.client) {
				extra = (
					React.createElement("em", {style: style}, React.createElement("br", null), "(", this.props.data, ")")
				);
				
				console.log('making client link with href='+link);

				return (
					React.createElement("span", null, 
						React.createElement("a", {href: link, onClick: this.handleClick}, this.state.client.name), 
						extra
					)
				);

			} else {
				return (
					React.createElement("span", null, this.props.data)
				);
			}
		}
		
	});

	module.exports = AdminClientLink;

/***/ },

/***/ 29:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, max_display_length = 16 // arbitrary number, Griddle lets content bleed into adjacent cells
		;

	var AdminClientLink = React.createClass({displayName: "AdminClientLink",
		
		getDefaultProps: function() {
			return {
				link_prefix: "mailto:"
			}
		},
		
		render: function() {
			if (!this.props.data) {
				return ( React.createElement("p", {className: "smaller"}, "none") )
			}

			var link = this.props.link_prefix + this.props.data
				, email_display = this.props.data
				, style = { fontSize: '0.65em' }
				;
			
			if (email_display.length > max_display_length) {
				email_display = email_display.substr(0, max_display_length) + '...';
			}
			
			return (
				React.createElement("a", {href: link}, email_display)
			);
		}
		
	});

	module.exports = AdminClientLink;

/***/ },

/***/ 30:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, max_display_length = 16 // arbitrary number, Griddle lets content bleed into adjacent cells
		;

	var WebLink = React.createClass({displayName: "WebLink",
		
		getDefaultProps: function() {
			return {
				link_prefix: ""
			}
		},
		
		format_link: function() {
			var link = this.props.link_prefix + this.props.data;
			if (!/^https?:\/\//.test(link)) {
				link = "http://" + link; // force http if none found
			}
			return link;
		},
		
		render: function() {
			if (!this.props.data) {
				return ( React.createElement("p", {className: "smaller"}, "none") )
			}

			var link = this.format_link()
				, link_display = this.props.data
				, style = { fontSize: '0.65em' }
				;
			
			if (link_display.length > max_display_length) { 
				link_display = link_display.substr(0, max_display_length) + '...';
			}
			
			return (
				React.createElement("a", {href: link, target: "_new"}, link_display)
			);
		}
		
	});

	module.exports = WebLink;

/***/ },

/***/ 31:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(13)
		, AdminStore = __webpack_require__(8)
		;

	var AdminLocationLink = React.createClass({displayName: "AdminLocationLink",
		
		getDefaultProps: function() {
			return {
				link_prefix: "/admin/clients/"
			}
		},
		
		getInitialState: function() { return { client: false } },

		handleClick: function(e) {
			if (this.props.rowData.handleLocationClick) {
				e.preventDefault();
				this.props.rowData.handleLocationClick(this.props.data);
			}
		},
		
		componentDidMount: function() {
			if (this.props.data) {
				this.setState({
					location: AdminStore.getClientLocation(this.props.rowData.client_id, this.props.data)
				});
			}
		},
		
		render: function() {

			var prefix = this.props.rowData.location_link_prefix || this.props.link_prefix
				, link = prefix + this.props.data
				, extra
				, name
				, style = { fontSize: '0.85em' }
				;
			if (this.state.location) {
				var LOC = this.state.location; // just for easy reading
				extra = (
					React.createElement("em", {style: style}, React.createElement("br", null), LOC.address_line1, ", ", LOC.city, ", ", LOC.state)
				);
				return (
					React.createElement("span", null, 
						React.createElement("a", {href: link, onClick: this.handleClick}, this.state.location.name), 
						extra
					)
				);
			} else {
				return (
					React.createElement("span", null, this.props.data)
				);
			}
		}
		
	});

	module.exports = AdminLocationLink;

/***/ },

/***/ 33:
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(55).Dispatcher
		, AppDispatcher = new Dispatcher()
		;

	AppDispatcher.handleViewAction = function(action) {
		this.dispatch({
			source: 'VIEW_ACTION',
			action: action // <<< this is an object, not a string: { actionType: FOO_CONSTANT, data: {} }
		});
	};

	AppDispatcher.handleServerAction = function(action) {
		this.dispatch({
			source: 'SERVER_ACTION',
			action: action // <<< this is an object, not a string: { actionType: FOO_CONSTANT, data: {} }
		});
	};

	module.exports = AppDispatcher;

/***/ },

/***/ 34:
/***/ function(module, exports, __webpack_require__) {

	/*****

			WEBPACK IS PUKING on including this in a "watch" update,
			have to stop and start it, which is fucking annoying.
			so, make my own key mirror.

	********/
	//var keyMirror = require('react/lib/keyMirror');

	var keyMirror = function(obj) {
		Object.keys(obj).forEach(function(prop) {
			obj[prop] = prop;
		});
		return obj;
	}

	// simply mirrors the key to the value, so you don't have to type doubles all the time... :)
	var appConstants = keyMirror({
		LOAD_MACHINES: null,
	//	GET_MACHINE: null, // Store action
		NEW_MACHINE: null,
		SAVE_MACHINE: null,
		REMOVE_MACHINE: null,
		MACHINE_SAVED: null,

		LOAD_CUSTOMER_LIST: null,
	//	GET_CUSTOMER: null, // Store action
	//	NEW_CUSTOMER: null, // don't think dispensaries should be manually adding Customers, with exception of adding Customer to screen for ZaZZZ new account
		SAVE_CUSTOMER: null,
	//	REMOVE_CUSTOMER: null,

	// admin users generally:
		LOAD_USER_LIST: null,
	//	GET_USER: null, // Store action
		NEW_USER: null,
		SAVE_USER: null,
		REMOVE_USER: null, // if not admin (i.e., dispensary UI), should not be able to wholly remove a user from the system. could be a customer!

		LOAD_CLIENT_LIST: null, // admin-only action!
	//	GET_CLIENT: null, // shared client / admin action .... well, actually this is a method on ClientStore
		NEW_CLIENT: null,
		LOAD_CLIENT_USER_LIST: null, // per-client basis
		NEW_CLIENT_USER: null,
		SAVE_CLIENT: null,
		CLIENT_SAVED: null,
		CLIENT_RETRIEVED: null,
		REMOVE_CLIENT: null,
		CLIENT_SET_OWNER: null,
		CLIENT_ADD_LOCATION: null,
		LOAD_CLIENT_LOCATIONS: null,
		LOAD_CLIENT_VENDING_MACHINES: null,
	//	SET_CURRENT_CLIENT: null,

	//	LOAD_LOCATION_LIST: null, // LOAD_CLIENT_LOCATIONS is the one to use
	//	GET_LOCATION: null, // Store action
		NEW_LOCATION: null,
		SAVE_LOCATION: null,
		LOCATION_SET_MANAGER: null,
		LOCATION_ADD_EMPLOYEE: null,
		LOCATION_REMOVE_EMPLOYEE: null,
		LOCATION_ADD_VENDING_MACHINE: null,
		LOCATION_REMOVE_VENDING_MACHINE: null,
		LOAD_LOCATION_VENDING_MACHINES: null,
	//	REMOVE_LOCATION: null,

		LOAD_ZAZZZ_SINGLE_TRANSACTION: null,
		LOAD_ZAZZZ_TRANSACTIONS: null,
		TX_REFUND_COMPLETE: null,

	// Client Dashboard Constants
		LOAD_LAST_THIRTY_DAYS_TXN_BAR_CHART_DATA: null
	});

	module.exports = appConstants;


/***/ },

/***/ 36:
/***/ function(module, exports, __webpack_require__) {

	/***

		DEVNOTE: need to change this to use websockets (i.e., true async as websockets have no response!)

	**/

	var axios = __webpack_require__(12)
		;

	module.exports = {
		
		getClients: function(cb) {
			axios({
				method: 'get',
				url: '/data/clients'
			})
			
			.then(function(response) {
				console.log('got ClientList data!');
				console.dir(response.data);
				cb(null, response.data);

			}.bind(this))
			
			.catch(function(err) {
				console.error('error getting data: ');
				console.dir(err);
				cb(err);
			});
		}
		
	};


/***/ },

/***/ 37:
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },

/***/ 38:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);
	var GridTitle = __webpack_require__(53);
	var GridRowContainer = __webpack_require__(54);
	var ColumnProperties = __webpack_require__(45);
	var RowProperties = __webpack_require__(46);
	var _ = __webpack_require__(52);

	var GridTable = React.createClass({
	  displayName: "GridTable",
	  getDefaultProps: function () {
	    return {
	      data: [],
	      columnSettings: null,
	      rowSettings: null,
	      sortSettings: null,
	      className: "",
	      enableInfiniteScroll: false,
	      nextPage: null,
	      hasMorePages: false,
	      useFixedHeader: false,
	      useFixedLayout: true,
	      paddingHeight: null,
	      rowHeight: null,
	      infiniteScrollLoadTreshold: null,
	      bodyHeight: null,
	      tableHeading: "",
	      useGriddleStyles: true,
	      useGriddleIcons: true,
	      isSubGriddle: false,
	      parentRowCollapsedClassName: "parent-row",
	      parentRowExpandedClassName: "parent-row expanded",
	      parentRowCollapsedComponent: "▶",
	      parentRowExpandedComponent: "▼",
	      externalLoadingComponent: null,
	      externalIsLoading: false };
	  },
	  getInitialState: function () {
	    return {
	      scrollTop: 0,
	      scrollHeight: this.props.bodyHeight,
	      clientHeight: this.props.bodyHeight
	    };
	  },
	  componentDidMount: function () {
	    // After the initial render, see if we need to load additional pages.
	    this.gridScroll();
	  },
	  componentDidUpdate: function (prevProps, prevState) {
	    // After the subsequent renders, see if we need to load additional pages.
	    this.gridScroll();
	  },
	  gridScroll: function () {
	    if (this.props.enableInfiniteScroll && !this.props.externalIsLoading) {
	      // If the scroll height is greater than the current amount of rows displayed, update the page.
	      var scrollable = this.refs.scrollable.getDOMNode();
	      var scrollTop = scrollable.scrollTop;
	      var scrollHeight = scrollable.scrollHeight;
	      var clientHeight = scrollable.clientHeight;

	      // If the scroll position changed and the difference is greater than a row height
	      if (this.props.rowHeight !== null && this.state.scrollTop !== scrollTop && Math.abs(this.state.scrollTop - scrollTop) >= this.getAdjustedRowHeight()) {
	        var newState = {
	          scrollTop: scrollTop,
	          scrollHeight: scrollHeight,
	          clientHeight: clientHeight
	        };

	        // Set the state to the new state
	        this.setState(newState);
	      }

	      // Determine the diff by subtracting the amount scrolled by the total height, taking into consideratoin
	      // the spacer's height.
	      var scrollHeightDiff = scrollHeight - (scrollTop + clientHeight) - this.props.infiniteScrollLoadTreshold;

	      // Make sure that we load results a little before reaching the bottom.
	      var compareHeight = scrollHeightDiff * 0.6;

	      if (compareHeight <= this.props.infiniteScrollLoadTreshold) {
	        this.props.nextPage();
	      }
	    }
	  },
	  verifyProps: function () {
	    if (this.props.columnSettings === null) {
	      console.error("gridTable: The columnSettings prop is null and it shouldn't be");
	    }
	    if (this.props.rowSettings === null) {
	      console.error("gridTable: The rowSettings prop is null and it shouldn't be");
	    }
	  },
	  getAdjustedRowHeight: function () {
	    return this.props.rowHeight + this.props.paddingHeight * 2; // account for padding.
	  },
	  getNodeContent: function () {
	    this.verifyProps();
	    var that = this;

	    //figure out if we need to wrap the group in one tbody or many
	    var anyHasChildren = false;

	    // If the data is still being loaded, don't build the nodes unless this is an infinite scroll table.
	    if (!this.props.externalIsLoading || this.props.enableInfiniteScroll) {
	      var nodeData = that.props.data;
	      var aboveSpacerRow = null;
	      var belowSpacerRow = null;
	      var usingDefault = false;

	      // If we have a row height specified, only render what's going to be visible.
	      if (this.props.enableInfiniteScroll && this.props.rowHeight !== null && this.refs.scrollable !== undefined) {
	        var adjustedHeight = that.getAdjustedRowHeight();
	        var visibleRecordCount = Math.ceil(that.state.clientHeight / adjustedHeight);

	        // Inspired by : http://jsfiddle.net/vjeux/KbWJ2/9/
	        var displayStart = Math.max(0, Math.floor(that.state.scrollTop / adjustedHeight) - visibleRecordCount * 0.25);
	        var displayEnd = Math.min(displayStart + visibleRecordCount * 1.25, this.props.data.length - 1);

	        // Split the amount of nodes.
	        nodeData = nodeData.slice(displayStart, displayEnd + 1);

	        // Set the above and below nodes.
	        var aboveSpacerRowStyle = { height: displayStart * adjustedHeight + "px" };
	        aboveSpacerRow = React.createElement("tr", { key: "above-" + aboveSpacerRowStyle.height, style: aboveSpacerRowStyle });
	        var belowSpacerRowStyle = { height: (this.props.data.length - displayEnd) * adjustedHeight + "px" };
	        belowSpacerRow = React.createElement("tr", { key: "below-" + belowSpacerRowStyle.height, style: belowSpacerRowStyle });
	      }

	      var nodes = nodeData.map(function (row, index) {
	        var hasChildren = typeof row.children !== "undefined" && row.children.length > 0;
	        var uniqueId = that.props.rowSettings.getRowKey(row);

	        //at least one item in the group has children.
	        if (hasChildren) {
	          anyHasChildren = hasChildren;
	        }

	        return React.createElement(GridRowContainer, { useGriddleStyles: that.props.useGriddleStyles, isSubGriddle: that.props.isSubGriddle,
	          parentRowExpandedClassName: that.props.parentRowExpandedClassName, parentRowCollapsedClassName: that.props.parentRowCollapsedClassName,
	          parentRowExpandedComponent: that.props.parentRowExpandedComponent, parentRowCollapsedComponent: that.props.parentRowCollapsedComponent,
	          data: row, key: uniqueId + "-container", uniqueId: uniqueId, columnSettings: that.props.columnSettings, rowSettings: that.props.rowSettings, paddingHeight: that.props.paddingHeight,
	          rowHeight: that.props.rowHeight, hasChildren: hasChildren, tableClassName: that.props.className });
	      });

	      // Add the spacer rows for nodes we're not rendering.
	      if (aboveSpacerRow) {
	        nodes.unshift(aboveSpacerRow);
	      }
	      if (belowSpacerRow) {
	        nodes.push(belowSpacerRow);
	      }

	      // Send back the nodes.
	      return {
	        nodes: nodes,
	        anyHasChildren: anyHasChildren
	      };
	    } else {
	      return null;
	    }
	  },
	  render: function () {
	    var that = this;
	    var nodes = [];

	    // for if we need to wrap the group in one tbody or many
	    var anyHasChildren = false;

	    // Grab the nodes to render
	    var nodeContent = this.getNodeContent();
	    if (nodeContent) {
	      nodes = nodeContent.nodes;
	      anyHasChildren = nodeContent.anyHasChildren;
	    }

	    var gridStyle = null;
	    var loadingContent = null;
	    var tableStyle = {
	      width: "100%"
	    };

	    if (this.props.useFixedLayout) {
	      tableStyle.tableLayout = "fixed";
	    }

	    if (this.props.enableInfiniteScroll) {
	      // If we're enabling infinite scrolling, we'll want to include the max height of the grid body + allow scrolling.
	      gridStyle = {
	        position: "relative",
	        overflowY: "scroll",
	        height: this.props.bodyHeight + "px",
	        width: "100%"
	      };
	    }

	    // If we're currently loading, populate the loading content
	    if (this.props.externalIsLoading) {
	      var defaultLoadingStyle = null;
	      var defaultColSpan = null;

	      if (this.props.useGriddleStyles) {
	        defaultLoadingStyle = {
	          textAlign: "center",
	          paddingBottom: "40px"
	        };

	        defaultColSpan = this.props.columnSettings.getVisibleColumnCount();
	      }

	      var loadingComponent = this.props.externalLoadingComponent ? React.createElement(this.props.externalLoadingComponent, null) : React.createElement(
	        "div",
	        null,
	        "Loading..."
	      );

	      loadingContent = React.createElement(
	        "tbody",
	        null,
	        React.createElement(
	          "tr",
	          null,
	          React.createElement(
	            "td",
	            { style: defaultLoadingStyle, colSpan: defaultColSpan },
	            loadingComponent
	          )
	        )
	      );
	    }

	    //construct the table heading component
	    var tableHeading = this.props.showTableHeading ? React.createElement(GridTitle, { useGriddleStyles: this.props.useGriddleStyles, useGriddleIcons: this.props.useGriddleIcons,
	      sortSettings: this.props.sortSettings,
	      columnSettings: this.props.columnSettings,
	      rowSettings: this.props.rowSettings }) : "";

	    //check to see if any of the rows have children... if they don't wrap everything in a tbody so the browser doesn't auto do this
	    if (!anyHasChildren) {
	      nodes = React.createElement(
	        "tbody",
	        null,
	        nodes
	      );
	    }

	    var pagingContent = "";
	    if (this.props.showPager) {
	      var pagingStyles = this.props.useGriddleStyles ? {
	        padding: "0",
	        backgroundColor: "#EDEDED",
	        border: "0",
	        color: "#222"
	      } : null;
	      pagingContent = React.createElement(
	        "tbody",
	        null,
	        React.createElement(
	          "tr",
	          null,
	          React.createElement(
	            "td",
	            { colSpan: this.props.columnSettings.getVisibleColumnCount(), style: pagingStyles, className: "footer-container" },
	            this.props.pagingContent
	          )
	        )
	      );
	    }

	    // If we have a fixed header, split into two tables.
	    if (this.props.useFixedHeader) {
	      if (this.props.useGriddleStyles) {
	        tableStyle.tableLayout = "fixed";
	      }

	      return React.createElement(
	        "div",
	        null,
	        React.createElement(
	          "table",
	          { className: this.props.className, style: this.props.useGriddleStyles && tableStyle || null },
	          tableHeading
	        ),
	        React.createElement(
	          "div",
	          { ref: "scrollable", onScroll: this.gridScroll, style: gridStyle },
	          React.createElement(
	            "table",
	            { className: this.props.className, style: this.props.useGriddleStyles && tableStyle || null },
	            nodes,
	            loadingContent,
	            pagingContent
	          )
	        )
	      );
	    }

	    return React.createElement(
	      "div",
	      { ref: "scrollable", onScroll: this.gridScroll, style: gridStyle },
	      React.createElement(
	        "table",
	        { className: this.props.className, style: this.props.useGriddleStyles && tableStyle || null },
	        tableHeading,
	        nodes,
	        loadingContent,
	        pagingContent
	      )
	    );
	  }
	});

	module.exports = GridTable;

/***/ },

/***/ 39:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);

	var GridFilter = React.createClass({
	    displayName: "GridFilter",
	    getDefaultProps: function () {
	        return {
	            placeholderText: ""
	        };
	    },
	    handleChange: function (event) {
	        this.props.changeFilter(event.target.value);
	    },
	    render: function () {
	        return React.createElement(
	            "div",
	            { className: "filter-container" },
	            React.createElement("input", { type: "text", name: "filter", placeholder: this.props.placeholderText, className: "form-control", onChange: this.handleChange })
	        );
	    }
	});

	module.exports = GridFilter;

/***/ },

/***/ 40:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);
	var _ = __webpack_require__(52);

	//needs props maxPage, currentPage, nextFunction, prevFunction
	var GridPagination = React.createClass({
	    displayName: "GridPagination",
	    getDefaultProps: function () {
	        return {
	            maxPage: 0,
	            nextText: "",
	            previousText: "",
	            currentPage: 0,
	            useGriddleStyles: true,
	            nextClassName: "griddle-next",
	            previousClassName: "griddle-previous",
	            nextIconComponent: null,
	            previousIconComponent: null
	        };
	    },
	    pageChange: function (event) {
	        this.props.setPage(parseInt(event.target.value, 10) - 1);
	    },
	    render: function () {
	        var previous = "";
	        var next = "";

	        if (this.props.currentPage > 0) {
	            previous = React.createElement(
	                "button",
	                { type: "button", onClick: this.props.previous, style: this.props.useGriddleStyles ? { color: "#222", border: "none", background: "none", margin: "0 0 0 10px" } : null },
	                this.props.previousIconComponent,
	                this.props.previousText
	            );
	        }

	        if (this.props.currentPage !== this.props.maxPage - 1) {
	            next = React.createElement(
	                "button",
	                { type: "button", onClick: this.props.next, style: this.props.useGriddleStyles ? { color: "#222", border: "none", background: "none", margin: "0 10px 0 0" } : null },
	                this.props.nextText,
	                this.props.nextIconComponent
	            );
	        }

	        var leftStyle = null;
	        var middleStyle = null;
	        var rightStyle = null;

	        if (this.props.useGriddleStyles === true) {
	            var baseStyle = {
	                float: "left",
	                minHeight: "1px",
	                marginTop: "5px"
	            };

	            rightStyle = _.extend({ textAlign: "right", width: "34%" }, baseStyle);
	            middleStyle = _.extend({ textAlign: "center", width: "33%" }, baseStyle);
	            leftStyle = _.extend({ width: "33%" }, baseStyle);
	        }

	        var options = [];

	        for (var i = 1; i <= this.props.maxPage; i++) {
	            options.push(React.createElement(
	                "option",
	                { value: i, key: i },
	                i
	            ));
	        }

	        return React.createElement(
	            "div",
	            { style: this.props.useGriddleStyles ? { minHeight: "35px" } : null },
	            React.createElement(
	                "div",
	                { className: this.props.previousClassName, style: leftStyle },
	                previous
	            ),
	            React.createElement(
	                "div",
	                { className: "griddle-page", style: middleStyle },
	                React.createElement(
	                    "select",
	                    { value: this.props.currentPage + 1, onChange: this.pageChange },
	                    options
	                ),
	                " / ",
	                this.props.maxPage
	            ),
	            React.createElement(
	                "div",
	                { className: this.props.nextClassName, style: rightStyle },
	                next
	            )
	        );
	    }
	});

	module.exports = GridPagination;

/***/ },

/***/ 41:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);
	var _ = __webpack_require__(52);

	var GridSettings = React.createClass({
	    displayName: "GridSettings",
	    getDefaultProps: function () {
	        return {
	            columns: [],
	            columnMetadata: [],
	            selectedColumns: [],
	            settingsText: "",
	            maxRowsText: "",
	            resultsPerPage: 0,
	            enableToggleCustom: false,
	            useCustomComponent: false,
	            useGriddleStyles: true,
	            toggleCustomComponent: function () {}
	        };
	    },
	    setPageSize: function (event) {
	        var value = parseInt(event.target.value, 10);
	        this.props.setPageSize(value);
	    },
	    handleChange: function (event) {
	        if (event.target.checked === true && _.contains(this.props.selectedColumns, event.target.dataset.name) === false) {
	            this.props.selectedColumns.push(event.target.dataset.name);
	            this.props.setColumns(this.props.selectedColumns);
	        } else {
	            /* redraw with the selected columns minus the one just unchecked */
	            this.props.setColumns(_.without(this.props.selectedColumns, event.target.dataset.name));
	        }
	    },
	    render: function () {
	        var that = this;

	        var nodes = [];
	        //don't show column selector if we're on a custom component
	        if (that.props.useCustomComponent === false) {
	            nodes = this.props.columns.map(function (col, index) {
	                var checked = _.contains(that.props.selectedColumns, col);
	                //check column metadata -- if this one is locked make it disabled and don't put an onChange event
	                var meta = _.findWhere(that.props.columnMetadata, { columnName: col });
	                var displayName = col;

	                if (typeof meta !== "undefined" && typeof meta.displayName !== "undefined" && meta.displayName != null) {
	                    displayName = meta.displayName;
	                }

	                if (typeof meta !== "undefined" && meta != null && meta.locked) {
	                    return React.createElement(
	                        "div",
	                        { className: "column checkbox" },
	                        React.createElement(
	                            "label",
	                            null,
	                            React.createElement("input", { type: "checkbox", disabled: true, name: "check", checked: checked, "data-name": col }),
	                            displayName
	                        )
	                    );
	                } else if (typeof meta !== "undefined" && meta != null && typeof meta.visible !== "undefined" && meta.visible === false) {
	                    return null;
	                }
	                return React.createElement(
	                    "div",
	                    { className: "griddle-column-selection checkbox", style: that.props.useGriddleStyles ? { float: "left", width: "20%" } : null },
	                    React.createElement(
	                        "label",
	                        null,
	                        React.createElement("input", { type: "checkbox", name: "check", onChange: that.handleChange, checked: checked, "data-name": col }),
	                        displayName
	                    )
	                );
	            });
	        }

	        var toggleCustom = that.props.enableToggleCustom ? React.createElement(
	            "div",
	            { className: "form-group" },
	            React.createElement(
	                "label",
	                { htmlFor: "maxRows" },
	                React.createElement("input", { type: "checkbox", checked: this.props.useCustomComponent, onChange: this.props.toggleCustomComponent }),
	                " ",
	                this.props.enableCustomFormatText
	            )
	        ) : "";

	        var setPageSize = this.props.showSetPageSize ? React.createElement(
	            "div",
	            null,
	            React.createElement(
	                "label",
	                { htmlFor: "maxRows" },
	                this.props.maxRowsText,
	                ":",
	                React.createElement(
	                    "select",
	                    { onChange: this.setPageSize, value: this.props.resultsPerPage },
	                    React.createElement(
	                        "option",
	                        { value: "5" },
	                        "5"
	                    ),
	                    React.createElement(
	                        "option",
	                        { value: "10" },
	                        "10"
	                    ),
	                    React.createElement(
	                        "option",
	                        { value: "25" },
	                        "25"
	                    ),
	                    React.createElement(
	                        "option",
	                        { value: "50" },
	                        "50"
	                    ),
	                    React.createElement(
	                        "option",
	                        { value: "100" },
	                        "100"
	                    )
	                )
	            )
	        ) : "";


	        return React.createElement(
	            "div",
	            { className: "griddle-settings", style: this.props.useGriddleStyles ? { backgroundColor: "#FFF", border: "1px solid #DDD", color: "#222", padding: "10px", marginBottom: "10px" } : null },
	            React.createElement(
	                "h6",
	                null,
	                this.props.settingsText
	            ),
	            React.createElement(
	                "div",
	                { className: "griddle-columns", style: this.props.useGriddleStyles ? { clear: "both", display: "table", width: "100%", borderBottom: "1px solid #EDEDED", marginBottom: "10px" } : null },
	                nodes
	            ),
	            setPageSize,
	            toggleCustom
	        );
	    }
	});

	module.exports = GridSettings;

/***/ },

/***/ 42:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);

	var GridNoData = React.createClass({
	    displayName: "GridNoData",
	    getDefaultProps: function () {
	        return {
	            noDataMessage: "No Data"
	        };
	    },
	    render: function () {
	        var that = this;

	        return React.createElement(
	            "div",
	            null,
	            this.props.noDataMessage
	        );
	    }
	});

	module.exports = GridNoData;

/***/ },

/***/ 43:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   Griddle - Simple Grid Component for React
	   https://github.com/DynamicTyped/Griddle
	   Copyright (c) 2014 Ryan Lanciaux | DynamicTyped

	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);

	var CustomRowComponentContainer = React.createClass({
	  displayName: "CustomRowComponentContainer",
	  getDefaultProps: function () {
	    return {
	      data: [],
	      metadataColumns: [],
	      className: "",
	      customComponent: {}
	    };
	  },
	  render: function () {
	    var that = this;

	    if (typeof that.props.customComponent !== "function") {
	      console.log("Couldn't find valid template.");
	      return React.createElement("div", { className: this.props.className });
	    }

	    var nodes = this.props.data.map(function (row, index) {
	      return React.createElement(that.props.customComponent, { data: row, metadataColumns: that.props.metadataColumns, key: index });
	    });

	    var footer = this.props.showPager && this.props.pagingContent;
	    return React.createElement(
	      "div",
	      { className: this.props.className, style: this.props.style },
	      nodes
	    );
	  }
	});

	module.exports = CustomRowComponentContainer;

/***/ },

/***/ 44:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   Griddle - Simple Grid Component for React
	   https://github.com/DynamicTyped/Griddle
	   Copyright (c) 2014 Ryan Lanciaux | DynamicTyped

	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);

	var CustomPaginationContainer = React.createClass({
	  displayName: "CustomPaginationContainer",
	  getDefaultProps: function () {
	    return {
	      maxPage: 0,
	      nextText: "",
	      previousText: "",
	      currentPage: 0,
	      customPagerComponent: {}
	    };
	  },
	  render: function () {
	    var that = this;

	    if (typeof that.props.customPagerComponent !== "function") {
	      console.log("Couldn't find valid template.");
	      return React.createElement("div", null);
	    }

	    return React.createElement(that.props.customPagerComponent, { maxPage: this.props.maxPage, nextText: this.props.nextText, previousText: this.props.previousText, currentPage: this.props.currentPage, setPage: this.props.setPage, previous: this.props.previous, next: this.props.next });
	  }
	});

	module.exports = CustomPaginationContainer;

/***/ },

/***/ 45:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var _ = __webpack_require__(52);

	var ColumnProperties = (function () {
	  function ColumnProperties() {
	    var allColumns = arguments[0] === undefined ? [] : arguments[0];
	    var filteredColumns = arguments[1] === undefined ? [] : arguments[1];
	    var childrenColumnName = arguments[2] === undefined ? "children" : arguments[2];
	    var columnMetadata = arguments[3] === undefined ? [] : arguments[3];
	    var metadataColumns = arguments[4] === undefined ? [] : arguments[4];
	    _classCallCheck(this, ColumnProperties);

	    this.allColumns = allColumns;
	    this.filteredColumns = filteredColumns;
	    this.childrenColumnName = childrenColumnName;
	    this.columnMetadata = columnMetadata;
	    this.metadataColumns = metadataColumns;
	  }

	  _prototypeProperties(ColumnProperties, null, {
	    getMetadataColumns: {
	      value: function getMetadataColumns() {
	        var meta = _.map(_.where(this.columnMetadata, { visible: false }), function (item) {
	          return item.columnName;
	        });
	        if (meta.indexOf(this.childrenColumnName) < 0) {
	          meta.push(this.childrenColumnName);
	        }
	        return meta.concat(this.metadataColumns);
	      },
	      writable: true,
	      configurable: true
	    },
	    getVisibleColumnCount: {
	      value: function getVisibleColumnCount() {
	        return this.getColumns().length;
	      },
	      writable: true,
	      configurable: true
	    },
	    getColumnMetadataByName: {
	      value: function getColumnMetadataByName(name) {
	        return _.findWhere(this.columnMetadata, { columnName: name });
	      },
	      writable: true,
	      configurable: true
	    },
	    hasColumnMetadata: {
	      value: function hasColumnMetadata() {
	        return this.columnMetadata !== null && this.columnMetadata.length > 0;
	      },
	      writable: true,
	      configurable: true
	    },
	    getMetadataColumnProperty: {
	      value: function getMetadataColumnProperty(columnName, propertyName, defaultValue) {
	        var meta = this.getColumnMetadataByName(columnName);

	        //send back the default value if meta isn't there
	        if (typeof meta === "undefined" || meta === null) {
	          return defaultValue;
	        }return meta.hasOwnProperty(propertyName) ? meta[propertyName] : defaultValue;
	      },
	      writable: true,
	      configurable: true
	    },
	    getColumns: {
	      value: function getColumns() {
	        var _this = this;
	        var ORDER_MAX = 100;
	        //if we didn't set default or filter
	        var filteredColumns = this.filteredColumns.length === 0 ? this.allColumns : this.filteredColumns;

	        filteredColumns = _.difference(filteredColumns, this.metadataColumns);

	        filteredColumns = _.sortBy(filteredColumns, function (item) {
	          var metaItem = _.findWhere(_this.columnMetadata, { columnName: item });

	          if (typeof metaItem === "undefined" || metaItem === null || isNaN(metaItem.order)) {
	            return ORDER_MAX;
	          }

	          return metaItem.order;
	        });

	        return filteredColumns;
	      },
	      writable: true,
	      configurable: true
	    }
	  });

	  return ColumnProperties;
	})();

	module.exports = ColumnProperties;

/***/ },

/***/ 46:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var _ = __webpack_require__(52);

	var RowProperties = (function () {
	  function RowProperties() {
	    var rowMetadata = arguments[0] === undefined ? {} : arguments[0];
	    _classCallCheck(this, RowProperties);

	    this.rowMetadata = rowMetadata;
	  }

	  _prototypeProperties(RowProperties, null, {
	    getRowKey: {
	      value: function getRowKey(row) {
	        var uniqueId;

	        if (this.hasRowMetadataKey()) {
	          uniqueId = row[this.rowMetadata.key];
	        } else {
	          uniqueId = _.uniqueId("grid_row");
	        }

	        //todo: add error handling

	        return uniqueId;
	      },
	      writable: true,
	      configurable: true
	    },
	    hasRowMetadataKey: {
	      value: function hasRowMetadataKey() {
	        return this.hasRowMetadata() && this.rowMetadata.key !== null && this.rowMetadata.key !== undefined;
	      },
	      writable: true,
	      configurable: true
	    },
	    getBodyRowMetadataClass: {
	      value: function getBodyRowMetadataClass(rowData) {
	        if (this.hasRowMetadata() && this.rowMetadata.bodyCssClassName !== null && this.rowMetadata.bodyCssClassName !== undefined) {
	          if (typeof this.rowMetadata.bodyCssClassName === "function") {
	            return this.rowMetadata.bodyCssClassName(rowData);
	          } else {
	            return this.rowMetadata.bodyCssClassName;
	          }
	        }
	        return null;
	      },
	      writable: true,
	      configurable: true
	    },
	    getHeaderRowMetadataClass: {
	      value: function getHeaderRowMetadataClass() {
	        return this.hasRowMetadata() && this.rowMetadata.headerCssClassName !== null && this.rowMetadata.headerCssClassName !== undefined ? this.rowMetadata.headerCssClassName : null;
	      },
	      writable: true,
	      configurable: true
	    },
	    hasRowMetadata: {
	      value: function hasRowMetadata() {
	        return this.rowMetadata !== null;
	      },
	      writable: true,
	      configurable: true
	    }
	  });

	  return RowProperties;
	})();

	module.exports = RowProperties;

/***/ },

/***/ 50:
/***/ function(module, exports, __webpack_require__) {

	/***

		DEVNOTE: need to change this to use websockets (i.e., true async as websockets have no response!)

	**/

	var axios = __webpack_require__(12)
	//	, ZaZZZActions = require('../actions/zazzzActions')
		;

	module.exports = {
		
		getMachines: function(cb) {

			axios({
				method: 'get',
				url: '/data/zazzz-machines'
			})
			
			.then(function(response) {
				console.log('got data!');
				console.dir(response.data);
				cb(null, response.data);

			}.bind(this))
			
			.catch(function(err) {
				console.error('error getting data: ');
				console.dir(err);
				cb(err);
			});
		},

		saveMachine: function(data, cb) {
			axios({
				method: 'post',
				url: '/data/zazzz-machines',
				data: data
			})
			
			.then(function(response) {
				console.log('machine is saved!');
				console.dir(response.data);
				cb(null, response.data);

			}.bind(this))
			
			.catch(function(err) {
				console.error('error saving data: ');
				console.dir(err);
				cb(err);
			});
		}
		
	};


/***/ },

/***/ 51:
/***/ function(module, exports, __webpack_require__) {

	/***

		DEVNOTE: need to change this to use websockets (i.e., true async as websockets have no response!)

	**/

	var axios = __webpack_require__(12)
		;

	module.exports = {

		saveClient: function(data, cb) {
			axios({
				method: 'post',
				url: '/data/save-client',
				data: data
			})
			
			.then(function(response) {
				//console.log('client is saved!');
				//console.dir(response.data);
				//console.log('cb');
				//console.dir(cb);
				cb(null, response.data);

			}.bind(this))
			
			.catch(function(err) {
				console.error('error saving data: ');
				console.dir(err);
				cb(err);
			});
		},

		getClientById: function(id, cb) {
			axios({
				method: 'get',
				url: '/data/get-client',
				params: { id: id }
			})
			
			.then(function(response) {
				//console.log('client is retrieved!');
				//console.dir(response.data);
				//console.log('cb');
				//console.dir(cb);
				cb(null, response.data);

			}.bind(this))
			
			.catch(function(err) {
				console.error('error retrieving data: ');
				console.dir(err);
				cb(err);
			});
		}
	};


/***/ },

/***/ 52:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.2
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.2';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var isArrayLike = function(collection) {
	    var length = collection && collection.length;
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given value (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, target, fromIndex) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    return _.indexOf(obj, target, typeof fromIndex == 'number' && fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (array == null) return [];
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = array.length; i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    if (array == null) return [];
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = array.length; i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, 'length').length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = list && list.length; i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = function(array, item, isSorted) {
	    var i = 0, length = array && array.length;
	    if (typeof isSorted == 'number') {
	      i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
	    } else if (isSorted && length) {
	      i = _.sortedIndex(array, item);
	      return array[i] === item ? i : -1;
	    }
	    if (item !== item) {
	      return _.findIndex(slice.call(array, i), _.isNaN);
	    }
	    for (; i < length; i++) if (array[i] === item) return i;
	    return -1;
	  };

	  _.lastIndexOf = function(array, item, from) {
	    var idx = array ? array.length : 0;
	    if (typeof from == 'number') {
	      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
	    }
	    if (item !== item) {
	      return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
	    }
	    while (--idx >= 0) if (array[idx] === item) return idx;
	    return -1;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = array != null && array.length;
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createIndexFinder(1);

	  _.findLastIndex = createIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    
	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of 
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
	  
	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },

/***/ 53:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);
	var _ = __webpack_require__(52);
	var ColumnProperties = __webpack_require__(45);

	var GridTitle = React.createClass({
	    displayName: "GridTitle",
	    getDefaultProps: function () {
	        return {
	            columnSettings: null,
	            rowSettings: null,
	            sortSettings: null,
	            headerStyle: null,
	            useGriddleStyles: true,
	            useGriddleIcons: true,
	            headerStyles: {} };
	    },
	    componentWillMount: function () {
	        this.verifyProps();
	    },
	    sort: function (event) {
	        this.props.sortSettings.changeSort(event.target.dataset.title || event.target.parentElement.dataset.title);
	    },
	    verifyProps: function () {
	        if (this.props.columnSettings === null) {
	            console.error("gridTitle: The columnSettings prop is null and it shouldn't be");
	        }

	        if (this.props.sortSettings === null) {
	            console.error("gridTitle: The sortSettings prop is null and it shouldn't be");
	        }
	    },
	    render: function () {
	        this.verifyProps();
	        var that = this;

	        var nodes = this.props.columnSettings.getColumns().map(function (col, index) {
	            var columnSort = "";
	            var sortComponent = null;
	            var titleStyles = null;

	            if (that.props.sortSettings.sortColumn == col && that.props.sortSettings.sortAscending) {
	                columnSort = that.props.sortSettings.sortAscendingClassName;
	                sortComponent = that.props.useGriddleIcons && that.props.sortSettings.sortAscendingComponent;
	            } else if (that.props.sortSettings.sortColumn == col && that.props.sortSettings.sortAscending === false) {
	                columnSort += that.props.sortSettings.sortDescendingClassName;
	                sortComponent = that.props.useGriddleIcons && that.props.sortSettings.sortDescendingComponent;
	            }


	            var meta = that.props.columnSettings.getColumnMetadataByName(col);
	            var columnIsSortable = that.props.columnSettings.getMetadataColumnProperty(col, "sortable", true);
	            var displayName = that.props.columnSettings.getMetadataColumnProperty(col, "displayName", col);

	            columnSort = meta == null ? columnSort : (columnSort && columnSort + " " || columnSort) + that.props.columnSettings.getMetadataColumnProperty(col, "cssClassName", "");

	            if (that.props.useGriddleStyles) {
	                titleStyles = {
	                    backgroundColor: "#EDEDEF",
	                    border: "0",
	                    borderBottom: "1px solid #DDD",
	                    color: "#222",
	                    padding: "5px",
	                    cursor: columnIsSortable ? "pointer" : "default"
	                };
	            }

	            return React.createElement(
	                "th",
	                { onClick: columnIsSortable ? that.sort : null, "data-title": col, className: columnSort, key: displayName, style: titleStyles },
	                displayName,
	                sortComponent
	            );
	        });

	        //Get the row from the row settings.
	        var className = that.props.rowSettings && that.props.rowSettings.getHeaderRowMetadataClass() || null;

	        return React.createElement(
	            "thead",
	            null,
	            React.createElement(
	                "tr",
	                {
	                    className: className,
	                    style: this.props.headerStyles },
	                nodes
	            )
	        );
	    }
	});

	module.exports = GridTitle;

/***/ },

/***/ 54:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);
	var GridRow = __webpack_require__(87);
	var ColumnProperties = __webpack_require__(45);

	var GridRowContainer = React.createClass({
	  displayName: "GridRowContainer",
	  getDefaultProps: function () {
	    return {
	      useGriddleStyles: true,
	      useGriddleIcons: true,
	      isSubGriddle: false,
	      columnSettings: null,
	      rowSettings: null,
	      paddingHeight: null,
	      rowHeight: null,
	      parentRowCollapsedClassName: "parent-row",
	      parentRowExpandedClassName: "parent-row expanded",
	      parentRowCollapsedComponent: "▶",
	      parentRowExpandedComponent: "▼"
	    };
	  },
	  getInitialState: function () {
	    return {
	      data: {},
	      showChildren: false
	    };
	  },
	  componentWillReceiveProps: function () {
	    this.setShowChildren(false);
	  },
	  toggleChildren: function () {
	    this.setShowChildren(this.state.showChildren === false);
	  },
	  setShowChildren: function (visible) {
	    this.setState({
	      showChildren: visible
	    });
	  },
	  verifyProps: function () {
	    if (this.props.columnSettings === null) {
	      console.error("gridRowContainer: The columnSettings prop is null and it shouldn't be");
	    }
	  },
	  render: function () {
	    this.verifyProps();
	    var that = this;

	    if (typeof this.props.data === "undefined") {
	      return React.createElement("tbody", null);
	    }
	    var arr = [];

	    arr.push(React.createElement(GridRow, { useGriddleStyles: this.props.useGriddleStyles, isSubGriddle: this.props.isSubGriddle, data: this.props.data, columnSettings: this.props.columnSettings, rowSettings: this.props.rowSettings,
	      hasChildren: that.props.hasChildren, toggleChildren: that.toggleChildren, showChildren: that.state.showChildren, key: that.props.uniqueId, useGriddleIcons: that.props.useGriddleIcons,
	      parentRowExpandedClassName: this.props.parentRowExpandedClassName, parentRowCollapsedClassName: this.props.parentRowCollapsedClassName,
	      parentRowExpandedComponent: this.props.parentRowExpandedComponent, parentRowCollapsedComponent: this.props.parentRowCollapsedComponent,
	      paddingHeight: that.props.paddingHeight, rowHeight: that.props.rowHeight }));
	    var children = null;

	    if (that.state.showChildren) {
	      children = that.props.hasChildren && this.props.data.children.map(function (row, index) {
	        if (typeof row.children !== "undefined") {
	          return React.createElement(
	            "tr",
	            { style: { paddingLeft: 5 } },
	            React.createElement(
	              "td",
	              { colSpan: that.props.columnSettings.getVisibleColumnCount(), className: "griddle-parent", style: that.props.useGriddleStyles && { border: "none", padding: "0 0 0 5px" } },
	              React.createElement(Griddle, { isSubGriddle: true, results: [row], columns: that.props.columnSettings.getColumns(), tableClassName: that.props.tableClassName, parentRowExpandedClassName: that.props.parentRowExpandedClassName,
	                parentRowCollapsedClassName: that.props.parentRowCollapsedClassName,
	                showTableHeading: false, showPager: false, columnMetadata: that.props.columnMetadata,
	                parentRowExpandedComponent: that.props.parentRowExpandedComponent,
	                parentRowCollapsedComponent: that.props.parentRowCollapsedComponent,
	                paddingHeight: that.props.paddingHeight, rowHeight: that.props.rowHeight })
	            )
	          );
	        }

	        return React.createElement(GridRow, { useGriddleStyles: that.props.useGriddleStyles, isSubGriddle: that.props.isSubGriddle, data: row, columnSettings: that.props.columnSettings, isChildRow: true, columnMetadata: that.props.columnMetadata, key: that.props.rowSettings.getRowKey(row) });
	      });
	    }

	    return that.props.hasChildren === false ? arr[0] : React.createElement(
	      "tbody",
	      null,
	      that.state.showChildren ? arr.concat(children) : arr
	    );
	  }
	});

	module.exports = GridRowContainer;

/***/ },

/***/ 55:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(147)


/***/ },

/***/ 87:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
	*/
	var React = __webpack_require__(13);
	var _ = __webpack_require__(52);
	var ColumnProperties = __webpack_require__(45);

	var GridRow = React.createClass({
	        displayName: "GridRow",
	        getDefaultProps: function () {
	                return {
	                        isChildRow: false,
	                        showChildren: false,
	                        data: {},
	                        columnSettings: null,
	                        rowSettings: null,
	                        hasChildren: false,
	                        useGriddleStyles: true,
	                        useGriddleIcons: true,
	                        isSubGriddle: false,
	                        paddingHeight: null,
	                        rowHeight: null,
	                        parentRowCollapsedClassName: "parent-row",
	                        parentRowExpandedClassName: "parent-row expanded",
	                        parentRowCollapsedComponent: "▶",
	                        parentRowExpandedComponent: "▼"
	                };
	        },
	        handleClick: function () {
	                this.props.toggleChildren();
	        },
	        verifyProps: function () {
	                if (this.props.columnSettings === null) {
	                        console.error("gridRow: The columnSettings prop is null and it shouldn't be");
	                }
	        },
	        render: function () {
	                var _this = this;
	                this.verifyProps();
	                var that = this;
	                var columnStyles = null;

	                if (this.props.useGriddleStyles) {
	                        columnStyles = {
	                                margin: "0",
	                                padding: that.props.paddingHeight + "px 5px " + that.props.paddingHeight + "px 5px",
	                                height: that.props.rowHeight ? this.props.rowHeight - that.props.paddingHeight * 2 + "px" : null,
	                                backgroundColor: "#FFF",
	                                borderTopColor: "#DDD",
	                                color: "#222"
	                        };
	                }

	                var columns = this.props.columnSettings.getColumns();

	                // make sure that all the columns we need have default empty values
	                // otherwise they will get clipped
	                var defaults = _.object(columns, []);

	                // creates a 'view' on top the data so we will not alter the original data but will allow us to add default values to missing columns
	                var dataView = Object.create(this.props.data);

	                _.defaults(dataView, defaults);

	                var data = _.pairs(_.pick(dataView, columns));

	                var nodes = data.map(function (col, index) {
	                        var returnValue = null;
	                        var meta = _this.props.columnSettings.getColumnMetadataByName(col[0]);

	                        //todo: Make this not as ridiculous looking
	                        var firstColAppend = index === 0 && _this.props.hasChildren && _this.props.showChildren === false && _this.props.useGriddleIcons ? React.createElement(
	                                "span",
	                                { style: _this.props.useGriddleStyles && { fontSize: "10px", marginRight: "5px" } },
	                                _this.props.parentRowCollapsedComponent
	                        ) : index === 0 && _this.props.hasChildren && _this.props.showChildren && _this.props.useGriddleIcons ? React.createElement(
	                                "span",
	                                { style: _this.props.useGriddleStyles && { fontSize: "10px" } },
	                                _this.props.parentRowExpandedComponent
	                        ) : "";

	                        if (index === 0 && _this.props.isChildRow && _this.props.useGriddleStyles) {
	                                columnStyles = _.extend(columnStyles, { paddingLeft: 10 });
	                        }

	                        if (_this.props.columnSettings.hasColumnMetadata() && typeof meta !== "undefined") {
	                                var colData = typeof meta.customComponent === "undefined" || meta.customComponent === null ? col[1] : React.createElement(meta.customComponent, { data: col[1], rowData: dataView, metadata: meta });
	                                returnValue = meta == null ? returnValue : React.createElement(
	                                        "td",
	                                        { onClick: _this.props.hasChildren && _this.handleClick, className: meta.cssClassName, key: index, style: columnStyles },
	                                        colData
	                                );
	                        }

	                        return returnValue || React.createElement(
	                                "td",
	                                { onClick: _this.props.hasChildren && _this.handleClick, key: index, style: columnStyles },
	                                firstColAppend,
	                                col[1]
	                        );
	                });

	                //Get the row from the row settings.
	                var className = that.props.rowSettings && that.props.rowSettings.getBodyRowMetadataClass(that.props.data) || "standard-row";

	                if (that.props.isChildRow) {
	                        className = "child-row";
	                } else if (that.props.hasChildren) {
	                        className = that.props.showChildren ? this.props.parentRowExpandedClassName : this.props.parentRowCollapsedClassName;
	                }
	                return React.createElement(
	                        "tr",
	                        { className: className },
	                        nodes
	                );
	        }
	});

	module.exports = GridRow;

/***/ },

/***/ 147:
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Dispatcher
	 * @typechecks
	 */

	"use strict";

	var invariant = __webpack_require__(198);

	var _lastID = 1;
	var _prefix = 'ID_';

	/**
	 * Dispatcher is used to broadcast payloads to registered callbacks. This is
	 * different from generic pub-sub systems in two ways:
	 *
	 *   1) Callbacks are not subscribed to particular events. Every payload is
	 *      dispatched to every registered callback.
	 *   2) Callbacks can be deferred in whole or part until other callbacks have
	 *      been executed.
	 *
	 * For example, consider this hypothetical flight destination form, which
	 * selects a default city when a country is selected:
	 *
	 *   var flightDispatcher = new Dispatcher();
	 *
	 *   // Keeps track of which country is selected
	 *   var CountryStore = {country: null};
	 *
	 *   // Keeps track of which city is selected
	 *   var CityStore = {city: null};
	 *
	 *   // Keeps track of the base flight price of the selected city
	 *   var FlightPriceStore = {price: null}
	 *
	 * When a user changes the selected city, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'city-update',
	 *     selectedCity: 'paris'
	 *   });
	 *
	 * This payload is digested by `CityStore`:
	 *
	 *   flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'city-update') {
	 *       CityStore.city = payload.selectedCity;
	 *     }
	 *   });
	 *
	 * When the user selects a country, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'country-update',
	 *     selectedCountry: 'australia'
	 *   });
	 *
	 * This payload is digested by both stores:
	 *
	 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       CountryStore.country = payload.selectedCountry;
	 *     }
	 *   });
	 *
	 * When the callback to update `CountryStore` is registered, we save a reference
	 * to the returned token. Using this token with `waitFor()`, we can guarantee
	 * that `CountryStore` is updated before the callback that updates `CityStore`
	 * needs to query its data.
	 *
	 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       // `CountryStore.country` may not be updated.
	 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
	 *       // `CountryStore.country` is now guaranteed to be updated.
	 *
	 *       // Select the default city for the new country
	 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
	 *     }
	 *   });
	 *
	 * The usage of `waitFor()` can be chained, for example:
	 *
	 *   FlightPriceStore.dispatchToken =
	 *     flightDispatcher.register(function(payload) {
	 *       switch (payload.actionType) {
	 *         case 'country-update':
	 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
	 *           FlightPriceStore.price =
	 *             getFlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *
	 *         case 'city-update':
	 *           FlightPriceStore.price =
	 *             FlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *     }
	 *   });
	 *
	 * The `country-update` payload will be guaranteed to invoke the stores'
	 * registered callbacks in order: `CountryStore`, `CityStore`, then
	 * `FlightPriceStore`.
	 */

	  function Dispatcher() {
	    this.$Dispatcher_callbacks = {};
	    this.$Dispatcher_isPending = {};
	    this.$Dispatcher_isHandled = {};
	    this.$Dispatcher_isDispatching = false;
	    this.$Dispatcher_pendingPayload = null;
	  }

	  /**
	   * Registers a callback to be invoked with every dispatched payload. Returns
	   * a token that can be used with `waitFor()`.
	   *
	   * @param {function} callback
	   * @return {string}
	   */
	  Dispatcher.prototype.register=function(callback) {
	    var id = _prefix + _lastID++;
	    this.$Dispatcher_callbacks[id] = callback;
	    return id;
	  };

	  /**
	   * Removes a callback based on its token.
	   *
	   * @param {string} id
	   */
	  Dispatcher.prototype.unregister=function(id) {
	    invariant(
	      this.$Dispatcher_callbacks[id],
	      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
	      id
	    );
	    delete this.$Dispatcher_callbacks[id];
	  };

	  /**
	   * Waits for the callbacks specified to be invoked before continuing execution
	   * of the current callback. This method should only be used by a callback in
	   * response to a dispatched payload.
	   *
	   * @param {array<string>} ids
	   */
	  Dispatcher.prototype.waitFor=function(ids) {
	    invariant(
	      this.$Dispatcher_isDispatching,
	      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
	    );
	    for (var ii = 0; ii < ids.length; ii++) {
	      var id = ids[ii];
	      if (this.$Dispatcher_isPending[id]) {
	        invariant(
	          this.$Dispatcher_isHandled[id],
	          'Dispatcher.waitFor(...): Circular dependency detected while ' +
	          'waiting for `%s`.',
	          id
	        );
	        continue;
	      }
	      invariant(
	        this.$Dispatcher_callbacks[id],
	        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
	        id
	      );
	      this.$Dispatcher_invokeCallback(id);
	    }
	  };

	  /**
	   * Dispatches a payload to all registered callbacks.
	   *
	   * @param {object} payload
	   */
	  Dispatcher.prototype.dispatch=function(payload) {
	    invariant(
	      !this.$Dispatcher_isDispatching,
	      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
	    );
	    this.$Dispatcher_startDispatching(payload);
	    try {
	      for (var id in this.$Dispatcher_callbacks) {
	        if (this.$Dispatcher_isPending[id]) {
	          continue;
	        }
	        this.$Dispatcher_invokeCallback(id);
	      }
	    } finally {
	      this.$Dispatcher_stopDispatching();
	    }
	  };

	  /**
	   * Is this Dispatcher currently dispatching.
	   *
	   * @return {boolean}
	   */
	  Dispatcher.prototype.isDispatching=function() {
	    return this.$Dispatcher_isDispatching;
	  };

	  /**
	   * Call the callback stored with the given id. Also do some internal
	   * bookkeeping.
	   *
	   * @param {string} id
	   * @internal
	   */
	  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
	    this.$Dispatcher_isPending[id] = true;
	    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
	    this.$Dispatcher_isHandled[id] = true;
	  };

	  /**
	   * Set up bookkeeping needed when dispatching.
	   *
	   * @param {object} payload
	   * @internal
	   */
	  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
	    for (var id in this.$Dispatcher_callbacks) {
	      this.$Dispatcher_isPending[id] = false;
	      this.$Dispatcher_isHandled[id] = false;
	    }
	    this.$Dispatcher_pendingPayload = payload;
	    this.$Dispatcher_isDispatching = true;
	  };

	  /**
	   * Clear bookkeeping used for dispatching.
	   *
	   * @internal
	   */
	  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
	    this.$Dispatcher_pendingPayload = null;
	    this.$Dispatcher_isDispatching = false;
	  };


	module.exports = Dispatcher;


/***/ },

/***/ 198:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	"use strict";

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (false) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        'Invariant Violation: ' +
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;


/***/ }

});