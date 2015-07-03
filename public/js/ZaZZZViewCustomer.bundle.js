webpackJsonp([8],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , CustomerView = __webpack_require__(2)
	  ;

	var App = React.createClass({displayName: "App",
	  
	  getInitialState: function() {
	    return {
	      data: ''
	    }
	  },
	  
	  render: function(){
	    
	    var styles = {
	      marginBottom: 0
	    }
	    
	    /* window.ztx_id !!!! global reference, fix!!!! (just need react-router :) */
	    return (
	      React.createElement("div", null, 
	        React.createElement("p", null, React.createElement("a", {href: "/zashboard/customers", className: "button tiny", style: styles}, "« back to customer list")), 
	        React.createElement("h1", null, "Customer Details"), 
	        React.createElement("hr", null), 
	        React.createElement(CustomerView, {customer_id: window.customer_id})
	      )
	    );
	  }

	});

	React.render(
	  React.createElement(App, null),
	  document.getElementById('app')
	);


/***/ },

/***/ 2:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , CustomerStore = __webpack_require__(31)
	  , CustomerActions = __webpack_require__(33)
	  , TxActions = __webpack_require__(19)
	  , TxUtils = __webpack_require__(20)
	  , TxLink = __webpack_require__(232)
	  ;

	var CustomerView = React.createClass({displayName: "CustomerView",
	  
	  getInitialState: function() {

	    //this.timeframe = 'all';
	    //this.client_id = null;

	    return {
	      customer_info: false,
	      // all_data: {}
	    }
	  },
	  
	  componentDidMount: function() {
	    console.log("componentDidMount")
	    CustomerStore.addChangeListener(this._onChange);
	    CustomerActions.getSingleCustomer(this.props.customer_id);
	  },

	  componentWillUnmount: function() {
	    CustomerStore.removeChangeListener(this._onChange);
	  },

	  _onChange: function() {
	    console.log('[CustomerView] _onChange fired!');
	    this.setState({
	      customer_info: CustomerStore.getCustomerById(this.props.customer_id)
	      // all_data: CustomerStore.getAllData()
	    });
	  },
	  
	  render: function() {
	    if (this.state.customer_info) {
	      
	      cust = JSON.parse(JSON.stringify(this.state.customer_info));
	      var item_list = [];

	     cust.all_transactions.forEach(function(tx){
	        tx = TxUtils.calculate_totals(tx);
	        ckeys = Object.keys(tx.totals.cart_refactor);
	        var cart_items = [];
	        
	        ckeys.forEach(function(k) {
	          cart_items.push(tx.totals.cart_refactor[k]);
	        });
	        item_list.push(cart_items.map(function(item, idx) {
	          console.log(tx);
	          return (
	            React.createElement("ul", {key: idx}, 
	             React.createElement(TxLink, {tx_id: tx._id}), " ", tx.local_datestamp, " ", React.createElement("br", null), " Quantity: (", item.quantity, ") ", item.name, " @ $", item.price.toFixed(2), " Total spent: $", (item.price * item.quantity).toFixed(2)
	            )
	          );
	        }));
	        
	      });
	      return ( React.createElement("div", null, 
	                React.createElement("div", {className: "row"}, 
	                  React.createElement("div", {className: "large-4 columns"}, 
	                    React.createElement("h3", null, "Customer Info"), 
	                    React.createElement("p", null, 
	                      React.createElement("strong", null, "Name:"), 
	                      React.createElement("br", null), cust.firstname, " ", cust.lastname, 
	                      React.createElement("br", null), 
	                      React.createElement("strong", null, "Address:"), 
	                      React.createElement("br", null), cust.billing_address.address_line1, 
	                      React.createElement("br", null), cust.billing_address.city, ", ", cust.billing_address.state, " ", cust.billing_address.zip, 
	                      React.createElement("br", null), 
	                      React.createElement("strong", null, "Email:"), 
	                      React.createElement("br", null), cust.email, 
	                      React.createElement("br", null), 
	                      React.createElement("br", null), "Available credit:" + ' ' + 
	                       "$", cust.all_transactions.credit_available ? (cust.all_transactions.credit_available / 100).toFixed(2) : 0.00
	                    )
	                  ), 
	                  React.createElement("div", {className: "large-8 columns"}, 
	                    React.createElement("h3", null, " Transactions: "), 
	                    React.createElement("ul", null, item_list)
	                  )
	                )
	              )  
	        );
	      // tx = TxUtils.calculate_totals(tx);
	      
	      // var cart_items = []
	      //   , ckeys = Object.keys(tx.totals.cart_refactor);
	      
	      // ckeys.forEach(function(k) {
	      //   cart_items.push(tx.totals.cart_refactor[k]);
	      // });

	      // var item_list = cart_items.map(function(item, idx) {
	      //   return (
	      //     <li key={idx}>
	      //     ({item.quantity}) {item.name} @ ${item.price.toFixed(2)}: ${(item.price * item.quantity).toFixed(2)}
	      //     </li>
	      //   );
	      // });
	      
	      // var $CREDIT_HANDLER = tx.isRefunded ? 
	      // (<p>This transaction has already been refunded.</p>)
	      //   :
	      // (
	      //   <CreditHandler
	      //     credit={tx.totals.credit} userCreditAvailable={tx.user.credit_available}
	      //     refund_full_credit={this.refund_full_credit}
	      //     />
	      // )

	      // return (
	      //   <div>
	      //     <div className="row">
	      //       <div className="large-6 columns">
	      //         <h3>Transaction info</h3>
	      //         <p>
	      //           <strong>Purchased By:</strong>
	      //             <br />{cust.firstname} {cust.lastname}
	      //             // <br />Available credit: ${tx.user.credit_available ? (tx.user.credit_available / 100).toFixed(2) : 0.00}
	      //           <br /><br />
	      //           <strong>Purchase Location:</strong>
	      //             // <br />{tx.machine.location.address_line1}
	      //             // <br />{tx.machine.location.city}, {tx.machine.location.state} &nbsp;{tx.machine.location.zip}
	      //           <br /><br />
	      //           <strong>Date:</strong> {cust.creation_date}
	      //           <br /><br />
	      //           <strong>Items purchased:</strong>
	      //         </p>
	      //         <ul>
	      //           {item_list}
	      //         </ul>
	      //       </div>
	      //       <div className="large-6 columns">
	      //         <h3>Payment details</h3>
	              
	      //         <p>
	      //           // <strong>Total Spent:</strong> ${tx.totals.total_spent.toFixed(2)}
	      //         </p>
	              
	      //         {$CREDIT_HANDLER}
	      //       </div>
	      //     </div>
	      //   </div>
	      // );
	      
	      //     <div className="row">
	      //       <h4>YAY DATA!</h4>
	      //       <pre>{JSON.stringify(cust, null, 4)}</pre>
	      //     </div>
	      
	    } else {
	      return (
	        React.createElement("div", null, 
	          React.createElement("h4", null, "Loading transaction data, please wait a moment...")
	        )
	      );
	    }
	  },


	  
	  refund_full_credit: function() {
	    TxActions.refund_full_credit(this.state.data._id);
	  }
	  
	});



	var CreditHandler = React.createClass({displayName: "CreditHandler",
	  
	  full_refund: function(e) {
	    e.preventDefault();
	    this.props.refund_full_credit();
	/*
	    console.log('refund!');
	    console.log( JSON.stringify(this.props) );
	    console.log( typeof (this.props.credit) );
	    console.log( typeof (this.props.userCreditAvailable) );
	//*/
	  },
	  
	  render: function() {
	    if (this.props.credit) {
	      
	      var realCredit = this.props.credit * 100; // cents, not dollars
	      if (realCredit <= this.props.userCreditAvailable) {
	        return (
	          React.createElement("p", null, React.createElement("strong", null, "Credit sent to account:"), " $", this.props.credit.toFixed(2), 
	            React.createElement("br", null), 
	            React.createElement("br", null), 
	            React.createElement("button", {onClick: this.full_refund}, "Refund $", this.props.credit.toFixed(2), " credit")
	          )
	        );
	      } else {
	        return (
	          React.createElement("p", null, React.createElement("strong", null, "Credit sent to account:"), " $", this.props.credit.toFixed(2), 
	            React.createElement("br", null), 
	            React.createElement("br", null), 
	            "This customer does not have enough credit in his/her account for a full refund. Probably the customer has already spent the credit on a separate transaction."
	          )
	        );
	      }
	      
	    } else {
	      return (
	        React.createElement("p", null, React.createElement("strong", null, "Credit returned:"), " none")
	      );
	    }
	  }
	  
	});

	module.exports = CustomerView;

/***/ },

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(55)
		, appConstants = __webpack_require__(56)
		, TxAPI = __webpack_require__(59);
		;

	var ZaZZZTransactionActions = {
		
	// GETTERS
		getTransactions: function() {
			TxAPI.getTransactions(this.receiveTransactionData.bind(this))
		},
		
		getTransactionsByClientId: function(id) {
			//if (id) {
				TxAPI.getTransactionsByClientId(id, this.receiveTransactionData.bind(this))
			/*} else {
				return ZaZZZTransactionActions.getTransactions();
			}*/
		},
		
		getSingleTransaction: function(id) {
			TxAPI.getSingleTransaction(id, this.receiveSingleTransaction.bind(this));
		},
		
		refund_full_credit: function(id) {
			TxAPI.refund_full_credit(id, this.refundComplete.bind(this));
		},

	// RECEIVERS

		receiveTransactionData: function(err, data) {
			if (err) {
				console.error('[receiveTransactionData] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.LOAD_ZAZZZ_TRANSACTIONS,
					data: data
				});
			}
		},
		
		receiveSingleTransaction: function(err, data) {
			if (err) {
				console.error('[receiveTransactionData] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.LOAD_ZAZZZ_SINGLE_TRANSACTION,
					data: data
				});
			}
		},
		
		refundComplete: function(err, data) {
			if (err) {
				console.error('[refundComplete] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TX_REFUND_COMPLETE,
					data: data
				});
			}
		}
		
	};

	module.exports = ZaZZZTransactionActions;



/***/ },

/***/ 20:
/***/ function(module, exports, __webpack_require__) {

	var Utils = {
		
		calculate_totals: function(TX) {
			var total_spent = 0
				, credit = 0
				, cart_refactor = {}
				, currency_matrix = {}
				//, email_body = "Thanks for your ZaZZZ Purchase!\n"

				// need dynamic timezone setting!!!
				//, local_datestamp = moment( TX.remote_ts ).utcOffset( MACHINE.location.timezone ).format('YYYY-MM-DD HH:mm')
				;

			// react cannot load moment. fughetaboutit
			//TX.local_datestamp = moment( TX.remote_ts ).utcOffset( 'America/Phoenix' ).format('YYYY-MM-DD HH:mm');
			
			// figure out how to make a better datestamp. meh.
			var date = new Date( TX.remote_ts );
			//TX.local_datestamp = [date.getMonth() + 1, date.getDay(), date.getFullYear()].join('/');
			TX.local_datestamp = date.toDateString();

			//email_body += "Date purchased: "+TX.data_blob.date+"\n\n";
			//email_body += "Date purchased: "+local_datestamp+"\n\n";
			//email_body += "Your Cart purchases: \n\n";
			
			TX.data_blob.cart.forEach(function(item) {
		
				if (!cart_refactor[item.id]) {
					cart_refactor[item.id] = item;
					cart_refactor[item.id].quantity = 1;
					cart_refactor[item.id].name = item.name.replace(/\n/g, '');
				} else {
					cart_refactor[item.id].quantity += 1;
				}
		
			});

			// THIS IS SUSPECT for $bitcoin, because I'm not sure if BTC "amount" is set to US dollars or not
			TX.data_blob.providers.forEach(function(item) {
		
				if (!currency_matrix[item.name]) {
					currency_matrix[item.name] = item;
				} else {
					currency_matrix[item.name].amount += item.amount;
				}
		
				if (item.amount < 0) {
					total_spent += Math.abs(item.amount);
				} else {
					credit += Math.abs(item.amount);
				}
		
			});

			// this is wrong, it double-counts credit (credit is positive in the provider list when returned, or negative when used against a purchase)
			//total_spent += credit;
			
			TX.totals = {
				total_spent: total_spent,
				credit: credit,
				cart_refactor: cart_refactor,
				currency_matrix: currency_matrix
			}
			
			//*
			if (currency_matrix.ZazProvider && TX.data_blob.cart_id == 'e4e298e7-8638-4753-a96d-c9c07941fcee') {
				console.log("tx date: "+TX.local_date);
				console.log("currency matrix:\n" + JSON.stringify(currency_matrix, null, 4) );
				console.log("original set:\n" + JSON.stringify(TX.data_blob.providers, null, 4) );
				console.log( JSON.stringify(cart_refactor) );
				console.log( JSON.stringify(TX.totals) );
			}
			//*/

			return TX;
		}
		
	}

	module.exports = Utils;

/***/ },

/***/ 31:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(55)
		, appConstants = __webpack_require__(56)
		, objectAssign = __webpack_require__(57)
		, EventEmitter = __webpack_require__(65).EventEmitter
		, CHANGE_EVENT = 'customers_change'

		, _state = {
			//current_customer: false,
			list: []
		}
		;

	var setList = function(data){
		_state.list = data;
	};

	var addCustomer = function(data){
		var idx = false;
		
		_state.list.forEach(function(ITEM, x) { if (ITEM._id == data._id) { idx = x } });
		
		if (idx !== false) {
			_state.list[idx] = data;
		} else {
			_state.list.push(data);
		}
	};

	var customerStore = objectAssign({}, EventEmitter.prototype, {
		addChangeListener: function(cb){
			this.on(CHANGE_EVENT, cb);
		},

		removeChangeListener: function(cb){
			this.removeListener(CHANGE_EVENT, cb);
		},

		emitChange: function() {
			this.emit(CHANGE_EVENT);
		},
		
		getCustomerById: function(id){
			var idx = false;
	  
	  _state.list.forEach(function(ITEM, x) { if (ITEM._id == id) { idx = x } });
	  
	  if (idx !== false) {
	    return _state.list[idx];
	  }
	  return false
		},

		getCustomers: function(){
			return _state.list;
		}
	});

	customerStore.dispatch = AppDispatcher.register(function(payload){
	  var action = payload.action;
	  switch(action.actionType){

	    case appConstants.LOAD_CUSTOMER_LIST :
	      setList(action.data.data.users);
	      customerStore.emitChange();
	      break;

	    case appConstants.LOAD_CUSTOMER :
	      addCustomer(action.data.data);
	      customerStore.emitChange();
	      break;

	    default:
	      return true;
	  }
	});

	module.exports = customerStore;


/***/ },

/***/ 33:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(55)
		, appConstants = __webpack_require__(56)
		, CustAPI = __webpack_require__(62);
		;

	var ZaZZZCustomerActions = {
		
	// GETTERS
		getCustomers: function() {
			CustAPI.getCustomers(this.receiveCustomerData.bind(this))
		},
		
		getCustomersByClientId: function(id) {
			//if (id) {
				CustAPI.getCustomersByClientId(id, this.receiveCustomerData.bind(this))
			/*} else {
				return ZaZZZTransactionActions.getCustomers();
			}*/
		},
		
		getSingleCustomer: function(id) {
			CustAPI.getSingleCustomer(id, this.receiveSingleCustomer.bind(this));
		},
		
		refund_full_credit: function(id) {
			CustAPI.refund_full_credit(id, this.refundComplete.bind(this));
		},

	// RECEIVERS

		receiveCustomerData: function(err, data) {
			if (err) {
				console.error('[receiveCustomerData] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.LOAD_CUSTOMER_LIST,
					data: data
				});
			}
		},
		
		receiveSingleCustomer: function(err, data) {
			if (err) {
				console.error('[receiveCustomerData] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.LOAD_SINGLE_CUSTOMER,
					data: data
				});
			}
		},
		
		refundComplete: function(err, data) {
			if (err) {
				console.error('[refundComplete] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TX_REFUND_COMPLETE,
					data: data
				});
			}
		}
		
	};

	module.exports = ZaZZZCustomerActions;



/***/ },

/***/ 55:
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(99).Dispatcher
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

/***/ 56:
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

/***/ 59:
/***/ function(module, exports, __webpack_require__) {

	/***

		DEVNOTE: need to change this to use websockets (i.e., true async as websockets have no response!)

	**/

	var axios = __webpack_require__(15)
		// , TxActions = require('../actions/zazzzTransactionActions')
		;

	//console.dir(Object.keys(TxActions));

	module.exports = {
		
		getTransactions: function(cb) {
			axios({
				method: 'get',
				url: '/data/transactions',
				params: {
					ts: Date.now() // cache buster
				}
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
		
		getTransactionsByClientId: function(id, cb) {
			axios({
				method: 'get',
				url: '/data/transactions',
				params: {
					ts: Date.now(), // cache buster
					client_id: id
				}
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
		
		getSingleTransaction: function(tx_id, cb) {
			axios({
				method: 'get',
				url: '/data/single-transaction',
				params: {
					ts: Date.now(), // cache buster
					tx_id: tx_id
				}
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
		
		refund_full_credit: function(tx_id, cb) {
			axios({
				method: 'post',
				url: '/data/refund-transaction',
				data: {
					tx_id: tx_id
				}
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
		
	};


/***/ },

/***/ 62:
/***/ function(module, exports, __webpack_require__) {

	/***

		DEVNOTE: need to change this to use websockets (i.e., true async as websockets have no response!)

	**/

	var axios = __webpack_require__(15)
		// , TxActions = require('../actions/zazzzTransactionActions')
		;

	//console.dir(Object.keys(TxActions));

	module.exports = {
		
		getCustomers: function(cb) {
			axios({
				method: 'get',
				url: '/data/customers',
				params: {
					ts: Date.now() // cache buster
				}
			})
			
			.then(function(response) {
				console.log('[customers] got data');
				console.dir(response.data);
				cb(null, response.data);

			}.bind(this))
			
			.catch(function(err) {
				console.error('[customers] error getting data: ');
				console.dir(err);
				cb(err);
			});
		},
		
		getCustomersByClientId: function(id, cb) {
			axios({
				method: 'get',
				url: '/data/customers',
				params: {
					ts: Date.now(), // cache buster
					client_id: id
				}
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
		
		getSingleCustomer: function(customer_id, cb) {
			axios({
				method: 'get',
				url: '/data/single-customer',
				params: {
					// ts: Date.now(), // cache buster
					customer_id: customer_id
				}
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
		
		refund_full_credit: function(tx_id, cb) {
			axios({
				method: 'post',
				url: '/data/refund-customer',
				data: {
					tx_id: tx_id
				}
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
		
	};


/***/ },

/***/ 65:
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

/***/ 99:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(160)


/***/ },

/***/ 160:
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

	var invariant = __webpack_require__(214);

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

/***/ 214:
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


/***/ },

/***/ 232:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16);

	var styles = {
	  margin: '6px, 6px',
	  padding: '4px 4px',
	  textTransform: 'uppercase',
	  color: '#fff',
	  textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
	}

	var TxLink = React.createClass({displayName: "TxLink",
	  
	  render: function() {
	    var url = '/zashboard/transactions/' + this.props.tx_id;
	    console.log("link ran")
	    return (
	        React.createElement("a", {href: url, className: "button success radius", style: styles}, "View")
	    );
	  }
	  
	});


	module.exports = TxLink;

/***/ }

});