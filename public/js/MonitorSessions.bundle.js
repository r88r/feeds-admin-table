webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		, BarneyManager = __webpack_require__(148)
		;

	var App = React.createClass({displayName: "App",
		
		getInitialState: function() {
			return {
				data: ''
			}
		},
		
		render: function(){
			
			return (
				React.createElement("div", null, 
					React.createElement("h1", null, "ZaZZZ Monitor"), 
					React.createElement(BarneyManager, null), "," + ' ' +
						"document.getElementById('app')"
				)
			);
		}

	});

	React.render(
	  React.createElement(App, null),
	  document.getElementById('app')
	);


/***/ },

/***/ 148:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
	//	, SocketHandler = require('../utils/SocketHandler')
		, BarneySession = __webpack_require__(149)
		, MonitorSessionStore = __webpack_require__(167)
		, MonitorSessionActions = __webpack_require__(158)
		;

	var BarneyManager = React.createClass({displayName: "BarneyManager",
		
		getInitialState: function() {
			return {
				manager_id: 'barney-manager',
				sessions: []
			};
		},
		
		componentWillMount: function() {
		},

		componentDidMount: function() {
			MonitorSessionStore.addChangeListener(this._onSessionStoreChange);
			MonitorSessionActions.getSessions();
		},

		componentWillUnmount: function() {
			MonitorSessionStore.removeChangeListener(this._onSessionStoreChange);
		},
		
		_onSessionStoreChange: function() {
			this.setState({
			  sessions: MonitorSessionStore.getSessions()
			});
		},

		mark_session_closed: function(_id) {
			MonitorSessionActions.markSessionClosed(_id);
		},
		
		render: function() {
			var filtered_sessions = this.state.sessions.filter(function(S) {
				return !S.isClosed;
			});
			if (filtered_sessions.length) {
				
				if (filtered_sessions[0].creation_ts < filtered_sessions[ filtered_sessions.length - 1 ].creation_ts) {
					filtered_sessions = filtered_sessions.reverse();
				}

				var SH = null //SocketHandler
					, SC = this.socket_callback
					, MSC = this.mark_session_closed
					, barneyNodes = filtered_sessions.map(function (session, index) {
						//console.log('render this session: ' + session._id);
						return (
							React.createElement(BarneySession, {data: session, 
								mark_session_closed: MSC, 
								key: index + session.creation_ts}
								)
							//socket_handler={SH} socket_proxy={SC} />
						);
				});
				return React.createElement("ul", {className: "barneySessionList large-block-grid-3 medium-block-grid-3 small-block-grid-1"}, barneyNodes);
			
			} else {

				return (
					React.createElement("div", null, 
						"no barney sessions found"
					)
				);
			}
	    },
	    
	    socket_callback: function(data, action) {
	    	
	    	var sort_by_creation_ts = function(a, b) {
	    		var field = 'creation_ts';
				if (a[field] < b[field]) return -1;
				if (a[field] > b[field]) return 1;
				return 0;
	    	};
	    	
	    	if (data.session && data.session._id) {
	    		
	    		switch (action) {
	    			case 'new-barney-session':
	    			case 'zazzz-session':
						var S = this.state.sessions;
						S.push(data.session);
						this.setState({ sessions: S.sort( sort_by_creation_ts ) });
						break;
	    			
	    			case 'unmount-barney-session':
	    				var stack = JSON.parse(JSON.stringify(this.state.sessions))
	    					, new_stack = []
	    					;
	    				stack.forEach(function(node, index) {
	    					if (node._id !== data.session._id) {
	    						new_stack.push( JSON.parse(JSON.stringify(node)) );
	    					}
	    				});
	    				this.setState({ sessions: new_stack.sort( sort_by_creation_ts ) });
	    				break;
	    		
	    			default:
	    			
						console.log( arguments );
						throw new Error('no idea how to handle what I was sent... args above.');
						break;

				}

			} else if (action == 'init-client-sessions' && data.sessions && data.sessions.length) {
				this.setState({ sessions: data.sessions.sort( sort_by_creation_ts ) });
			}

	    }
		
	});

	module.exports = BarneyManager;

/***/ },

/***/ 149:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		, MonitorSessionView = __webpack_require__(151)
		, FraudStateWidget = __webpack_require__(155)
		, BarneySessionCloseButton = __webpack_require__(150)
		, BarneyTopper = __webpack_require__(153)

		, MonitorSessionActions = __webpack_require__(158)
		;

	var MonitorSession = React.createClass({displayName: "MonitorSession",
		
		getInitialState: function() {
			return {
				data: this.props.data,
				isViewingDetails: false
			};
		},
		
		componentWillMount: function() {
			this.userSetup();
		},

		componentDidMount: function() {
		},
		
		componentDidUpdate: function() {
			this.userSetup();
			if (this.state.isViewingDetails) {
				this.show_details();
			}
		},
		
		userSetup: function() {
			if (!this.state.user) {
				if ((this.props.data.user && this.props.data.user.firstname) || (this.props.data.swipe_card_data && this.props.data.swipe_card_data.Name)) {
					if (this.props.data.user && this.props.data.user.firstname) {
						var normalized_user = this.normalize_user_data(this.props.data.user, 'zazzz');
					} else {
						var normalized_user = this.normalize_user_data(this.props.data.swipe_card_data, 'la');
					}
				}
				this.setState({ user: normalized_user });
			}
		},

		componentWillUnmount: function() {
		},
		
		render: function() {
			var images = [];

			if (this.props.data.user && this.props.data.user.zazzz_image_captures) {
				this.props.data.user.zazzz_image_captures.forEach(function(url, idx) {
					images.push({ id: idx, url: url.image_url });
				});
			
			} else if (this.props.data.temporary_image_capture_urls) {
				this.props.data.temporary_image_capture_urls.forEach(function(url, idx) {
					images.push({ id: idx, url: url });
				});
			}
			
			images = images.reverse();
			
			var _Z = this.props.data.zazzz || { location: {} }
				;
			
			
			/**** aliases, used in two layouts ****/
			var $RAW_ID = (React.createElement("div", {className: "devnote clearfix"}, "(raw _id: ", this.props.data._id, ")"));
			
			var $MAIN_IMAGE = images.length ?
				( React.createElement("img", {src: images[0].url, className: "barney-image"}) )
				: ( React.createElement("p", null, "no image captured yet") );
			
			var $FRAUDSTATE = (
				React.createElement(FraudStateWidget, {
					mark_session_fraud: this.mark_session_fraud, 
					mark_session_cleared: this.mark_session_cleared, 
					mark_session_none: this.mark_session_none, 
					request_image: this.request_image, 
					fraud_level: this.props.data.fraud_level}
					)
			);
			
			var $CLOSE = (React.createElement(BarneySessionCloseButton, {mark_session_closed: this.mark_session_closed}));

			/**** -------- END aliases, used in two layouts ****/

			if (this.state.user) {
				
				var U = this.state.user;
				
				var $CUSTOMER_INFO = (
					React.createElement("p", {className: "user"}, U.name, 
						React.createElement("br", null), "Gender: ", U.sex.toLowerCase() == 'm' ? 'Male' : 'Female', 
						React.createElement("br", null), "Height: ", U.height, 
						React.createElement("br", null), "Age: ", U.age, 
						React.createElement("br", null), "Eyes: ", U.eye_color, 
						React.createElement("br", null), "Hair: ", U.hair_color, 
						$CLOSE
					)
				);

				$render = (
					React.createElement("li", null, React.createElement("div", {className: "barneySession"}, 
						React.createElement(BarneyTopper, {zazzz: _Z, data: this.state.data}), 
						$FRAUDSTATE, 
						React.createElement("div", {className: "row collapse customer-info"}, 
							React.createElement("div", {className: "large-7 columns"}, 
								React.createElement("div", {className: "main-image"}, 
									$MAIN_IMAGE
								), 
								React.createElement("p", {className: "text-center"}, React.createElement("button", {className: "button tiny warning", onClick: this.view_more_details}, "See more photos and video"))
							), 
							React.createElement("div", {className: "large-5 columns"}, 
								$CUSTOMER_INFO
							)
						), 
						$RAW_ID
					))
				);

			} else {
				$render = (
					React.createElement("li", null, React.createElement("div", {className: "barneySession"}, 
						React.createElement(BarneyTopper, {zazzz: _Z, data: this.state.data}), 
						$FRAUDSTATE, 
						React.createElement("div", {className: "row collapse customer-info"}, 
							React.createElement("div", {className: "large-7 columns"}, 
								React.createElement("div", {className: "main-image"}, 
									$MAIN_IMAGE
								)
							), 
							React.createElement("div", {className: "large-5 columns"}, 
								React.createElement("p", {className: "user"}, "User: unknown", $CLOSE)
							)
						), 
						$RAW_ID
					))

				);
			}
			
			return $render;
	    },
	    
	    normalize_user_data: function(data, type) {
	    	var obj = {};
	    	switch (type) {
	    		case 'zazzz':
	    		default:
	    			obj.age = age_from_date(data.dob);
	    			obj.birthday = moment( new Date(data.dob) ).format('MMM/DD/YYYY');
	    			obj.name = data.firstname + ' ' + data.lastname;
	    			for (var k in data) { obj[k] = data[k]; }
	    			break;

	    		case 'la':
	    			if (!data.Name) { console.error('no Name, bad LA data format???'); console.log(JSON.stringify(data, null, 4)); }
	    			obj.age = age_from_date(data.DateOfBirth);
	    			obj.birthday = moment( new Date(data.DateOfBirth) ).format('MMM/DD/YYYY');
	    			obj.name = data.Name;
	    			obj.eye_color = data.Eyes;
	    			obj.hair_color = data.Hair;
	    			obj.height = data.Height_Component_Feet + "' " + data.Height_Component_Inches + '"';
	    			obj.sex = data.Sex;
	    			break;
	    	}
	    	return obj;

			function age_from_date(datestring) {
				
				if (typeof datestring !== 'string') { return 'unknown date format for age calc: '+datestring; }
				
				var dob = new Date(datestring);
				if (dob.toString == 'Invalid Date') { return 'unknown date format for age calc: '+datestring; }

				var year=Number(dob.getFullYear());
				var month=Number(dob.getMonth());
				var day=Number(dob.getDate());
				var today=new Date();
				var age=today.getFullYear()-year;
				if (today.getMonth()<month || (today.getMonth()==month && today.getDate()<day)) { age--; }
				return(age);

			}
			
	    },
	    
	    mark_session_cleared: function() {
	    	MonitorSessionActions.markSession(this.props.data._id, 'cleared');
	    },
	    
	    mark_session_fraud: function() {
	    	MonitorSessionActions.markSession(this.props.data._id, 'fraud');
	    },
	    
	    mark_session_none: function() {
	    	MonitorSessionActions.markSession(this.props.data._id, 'none');
	    },
	    
	    mark_session_closed: function(e) {
	    	/*
	    	Object.keys(this.props).forEach(function(k) {
	    		console.log('prop: '+k+', type: '+typeof(this.props[k]));
	    	}.bind(this));
	    	*/
	    	this.props.mark_session_closed(this.props.data._id);
	    },

	    request_image: function(e) {
			if (e) e.preventDefault();
	    	MonitorSessionActions.requestImage({
	    		session_id: this.props.data._id,
	    		remote_session_id: this.props.data.remote_session_id,
	    		machine_id_internal: this.props.data.machine_id,
	    		machine_id: this.props.data.public_machine_id,
	    		user_id: this.props.data.user_id || null
	    	});
	    },
	    
	    request_video: function(e) {
			if (e) e.preventDefault();
	    	MonitorSessionActions.startVideo({
	    		session_id: this.props.data._id,
	    		machine_id: this.props.data.zazzz.machine_id
	    	});
	    },
	    
	    stop_video: function(e) {
			if (e) e.preventDefault();
	    	MonitorSessionActions.stopVideo({
	    		session_id: this.props.data._id,
	    		machine_id: this.props.data.zazzz.machine_id
	    	});
	    },

	    view_more_details: function(e) {
	    	if (e) e.preventDefault();
	    	this.setState({ isViewingDetails: true });
	    },
	    
	    detail_closed: function(e) {
	    	if (e) e.preventDefault();
	    	this.setState({ isViewingDetails: false });
	    },
	    
	    show_details: function() {
			React.render(
				React.createElement(MonitorSessionView, {
					data: this.state.data, 
					user: this.state.user, 
					mark_session_fraud: this.mark_session_fraud, 
					mark_session_cleared: this.mark_session_cleared, 
					mark_session_none: this.mark_session_none, 
					request_image: this.request_image, 
			        request_video: this.request_video, 
			        stop_video: this.stop_video, 
					close_view: this.detail_closed}
					),

				document.getElementById('BarneySessionDetails')
			);
	    }
		
	});

	module.exports = MonitorSession;

/***/ },

/***/ 150:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		;

	var BarneySessionCloseButton = React.createClass({displayName: "BarneySessionCloseButton",
		render: function() {
			return (React.createElement("button", {className: "right button tiny warning", onClick: this.props.mark_session_closed}, "CLOSE"));
		}
	});

	module.exports = BarneySessionCloseButton;

/***/ },

/***/ 151:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		, ImageGallery = __webpack_require__(152)
		, BarneyTopper = __webpack_require__(153)
		, FraudStateWidget = __webpack_require__(155)
		, BarneySessionCloseButton = __webpack_require__(150)
		, Video = __webpack_require__(169)
		;

	var MonitorSessionView = React.createClass({displayName: "MonitorSessionView",
		
		getInitialState: function() {
			return {
				data: this.props.data,
				show: 'photos'
			};
		},
		
		componentWillMount: function() {
			document.getElementById('BarneySessionDetails').style.display = 'block';
			document.getElementById('BarneySessionDetails').style.position = 'fixed';
			document.getElementById('BarneySessionMask').style.display = 'block';
			document.getElementById('BarneySessionMask').style.position = 'fixed';
		},

		componentDidMount: function() {
		},

		componentWillUnmount: function() {
		},
		
		componentWillReceiveProps: function() {
		},
		
		showPhotos: function(e) {
			e.preventDefault();
			this.setState({ show: 'photos' });
		},
		
		showVideo: function(e) {
			e.preventDefault();
			this.setState({ show: 'video' });
		},
		
		render: function() {
			
			var VIDPHOTO = this.state.show == 'photos' ? this.photo_widget() : this.video_widget()
				, _Z = this.props.data.zazzz || { location: {} }
				, U = this.props.user
				;
			
			return (
				React.createElement("div", {className: "row collapse barneySession barneySessionDetails"}, 
					React.createElement(BarneyTopper, {zazzz: _Z, data: this.state.data}), 
					React.createElement("div", {className: "large-7 medium-7 small-12 columns"}, 
						React.createElement("div", {className: "vid-photo"}, 
							React.createElement("p", null, React.createElement("a", {href: "#", onClick: this.showPhotos}, "Photos"), " | ", React.createElement("a", {href: "#", onClick: this.showVideo}, "Video")), 
							VIDPHOTO
						)
					), 
					React.createElement("div", {className: "large-5 medium-5 small-12 columns"}, 
						React.createElement(FraudStateWidget, {
							mark_session_fraud: this.props.mark_session_fraud, 
							mark_session_cleared: this.props.mark_session_cleared, 
							mark_session_none: this.props.mark_session_none, 
							request_image: this.props.request_image, 
							fraud_level: this.props.data.fraud_level}
							), 

						React.createElement("p", {className: "user"}, U.name, 
							React.createElement("br", null), "Gender: ", U.sex.toLowerCase() == 'm' ? 'Male' : 'Female', 
							React.createElement("br", null), "Height: ", U.height, 
							React.createElement("br", null), "Age: ", U.age, 
							React.createElement("br", null), "Eyes: ", U.eye_color, 
							React.createElement("br", null), "Hair: ", U.hair_color, 
							React.createElement(BarneySessionCloseButton, {mark_session_closed: this.close})
						)

					)
				)
			);
		},
		
		photo_widget: function() {

			var images = [];

			if (this.state.data.user && this.state.data.user.zazzz_image_captures) {
				this.state.data.user.zazzz_image_captures.forEach(function(url, idx) {
					images.push({ id: idx, url: url.image_url });
				});
			
			} else if (this.state.data.temporary_image_capture_urls) {
				this.state.data.temporary_image_capture_urls.forEach(function(url, idx) {
					images.push({ id: idx, url: url });
				});
			}
			
			images = images.reverse();

			return (React.createElement(ImageGallery, {images: images, max_show: "32"}));
		},
		
		video_widget: function() {

	        var url = "rtmp://core2.zazzz.us:1935/live/" + this.props.data.zazzz.machine_id;
	        //console.log('video_widget URL: ' + url);

		    // try calling this earlier...
		    this.props.request_video();
		    return (React.createElement(Video, {url: url, request_video: this.props.request_video, stop_video: this.props.stop_video, machine_id: this.props.data.zazzz.machine_id, zazzz: this.props.data.zazzz}));
		},
		
		close: function(e) {
			if (e) e.preventDefault();
			document.getElementById('BarneySessionDetails').style.display = 'none';
			document.getElementById('BarneySessionMask').style.display = 'none';
			//this.props.stop_video(); // done in <Video> component
			this.props.close_view();
			React.unmountComponentAtNode( document.getElementById('BarneySessionDetails') );
		}
	});

	module.exports = MonitorSessionView;

/***/ },

/***/ 152:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		;

	var ImageGallery = React.createClass({displayName: "ImageGallery",
		
		getInitialState: function() {
			return {
				current_image: null
			}
		},
		
		changeImage: function(e) {
			e.preventDefault();
			this.setState({ current_image: { url: e.target.src } });
		},

		render: function() {
			var images = this.props.images
				, max_show = this.props.max_show ? parseInt(this.props.max_show) : 0;
			if (images.length) {
				
				if (max_show && max_show < images.length) {
					images = images.slice(0, max_show);
				}

				var imageone = this.state.current_image || images[0];

				return (
					React.createElement("div", {className: "clearfix"}, 
						React.createElement("p", {className: "small"}, React.createElement("em", null, "Image captures, newest to oldest")), 
						React.createElement("div", null, 
							React.createElement("img", {src: imageone.url, className: "barney-image larger"})
						), 
						React.createElement("ul", {className: "large-block-grid-8 medium-block-grid-6 small-block-grid-4"}, 
						images.map(function(url) {
						  return React.createElement("li", {key: url.id}, React.createElement("img", {src: url.url, className: "barney-image-thumb", onClick: this.changeImage}));
						}.bind(this))
						)
					)
				)

			} else {
				return (React.createElement("p", null, "no images available"));
			}

		}
	});

	module.exports = ImageGallery;

/***/ },

/***/ 153:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		, moment = __webpack_require__(154)
		;

	var BarneyTopper = React.createClass({displayName: "BarneyTopper",
		render: function() {

			var _Z = this.props.zazzz
				, _login_time_ = moment(this.props.data.creation_date).format('LTS')
				, _login_date_ = moment(this.props.data.creation_date).format('ll')
				;
			
			return (
				React.createElement("div", {className: "_top"}, 
					React.createElement("div", null, 
					_login_time_, " ", React.createElement("em", {className: "mini-datestamp"}, _login_date_), " ", React.createElement("span", {className: "right machine_id"}, _Z.machine_id || 'unknown location')
					), 
					React.createElement("p", {className: "zazzz"}, 
					_Z.location.address_line1, ", ", _Z.location.city, ", ", _Z.location.state, "  ", _Z.location.zip
					)
				)
			);
		}
	});

	module.exports = BarneyTopper;

/***/ },

/***/ 154:
/***/ function(module, exports) {

	module.exports = moment;

/***/ },

/***/ 155:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		, BarneySessionButtons = __webpack_require__(156)
		, FraudLevelLabel = __webpack_require__(157)
		;

	var FraudStateWidget = React.createClass({displayName: "FraudStateWidget",
		render: function() {
			return (
				React.createElement("div", {className: "_fraudstate clearfix"}, 
					React.createElement("div", {className: "_fs_buttons"}, 
						React.createElement(BarneySessionButtons, {
							mark_session_fraud: this.props.mark_session_fraud, 
							mark_session_cleared: this.props.mark_session_cleared, 
							mark_session_none: this.props.mark_session_none, 
							request_image: this.props.request_image}
							)
					), 
					React.createElement(FraudLevelLabel, {fraud_level: this.props.fraud_level})
				)
			);
		}
	});

	module.exports = FraudStateWidget;

/***/ },

/***/ 156:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		, BarneySessionButtons = __webpack_require__(156)
		;

	var BarneySessionButtons = React.createClass({displayName: "BarneySessionButtons",
		
		render: function() {
			return (
				React.createElement("p", null, 
					React.createElement("button", {className: "button tiny alert", onClick: this.props.mark_session_fraud}, "FRAUD, KILL"), 
					React.createElement("button", {className: "button tiny success", onClick: this.props.mark_session_cleared}, "CLEARED"), 
					React.createElement("br", null), React.createElement("button", {className: "button tiny secondary", onClick: this.props.mark_session_none}, "RESET"), 
					React.createElement("button", {className: "button tiny secondary", onClick: this.props.request_image}, "+ IMAGE")
				)
			);
		}
		
	});

	module.exports = BarneySessionButtons;

/***/ },

/***/ 157:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		;

	var FraudLevelLabel = React.createClass({displayName: "FraudLevelLabel",
		
		render: function() {
			var fraud_classString = "fraud-level " + this.props.fraud_level;
			return (
				React.createElement("p", {className: fraud_classString}, React.createElement("span", {className: "fl-label"}, "fraud level:"), this.props.fraud_level)
			);
		}
		
	});

	module.exports = FraudLevelLabel;

/***/ },

/***/ 158:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(159)
		, appConstants = __webpack_require__(163)
		, MonitorSessionAPI
		, _store = {
			sessions: []
		}
		;

	var MonitorSessionActions = {

	// markers / local client housekeeping
		markSessionClosed: function(_id) {
			AppDispatcher.handleServerAction({
				actionType: appConstants.MARK_ZAZZZ_SESSION_CLOSED,
				data: _id
			});
		},

		markSessionOpen: function(_id) {
			AppDispatcher.handleServerAction({
				actionType: appConstants.MARK_ZAZZZ_SESSION_OPEN,
				data: _id
			});
		},
		
		markSession: function(_id, fraud_level) {
			MonitorSessionAPI.markSessionFraudLevel(_id, fraud_level);
		},
		
		requestImage: function(params) {
			MonitorSessionAPI.requestImage(params);
		},
		
		startVideo: function(params) {
			MonitorSessionAPI.startVideo(params);
		},
		
		stopVideo: function(params) {
			MonitorSessionAPI.stopVideo(params);
		},
		
	// GETTERS
		getSessions: function() {
			MonitorSessionAPI.getSessions(); //this.receiveSessionData.bind(this))
		},
		
		getSingleSession: function(id) {
			MonitorSessionAPI.getSingleSession(id); //, this.receiveSingleSession.bind(this));
		},
		

	// RECEIVERS
		receiveSessionData: function(err, data) {
			if (err) {
				console.error('[receiveTransactionData] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.GET_ZAZZZ_SESSIONS,
					data: data
				});
			}
		},
		
		receiveSingleSession: function(err, data) {
			if (err) {
				console.error('[receiveTransactionData] err!!! '+err);
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.GET_SINGLE_ZAZZZ_SESSION,
					data: data
				});
			}
		}
		
	};

	module.exports = window.MSA = MonitorSessionActions;

	// include race condition, must require this here or Actions is empty object:
	MonitorSessionAPI = __webpack_require__(164);


/***/ },

/***/ 159:
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(160).Dispatcher
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

/***/ 160:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(161)


/***/ },

/***/ 161:
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

	var invariant = __webpack_require__(162);

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

/***/ 162:
/***/ function(module, exports) {

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

/***/ 163:
/***/ function(module, exports) {

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

		MARK_ZAZZZ_SESSION_CLOSED: null,
		MARK_ZAZZZ_SESSION_OPEN: null,
		
		GET_ZAZZZ_SESSIONS: null,
		GET_SINGLE_ZAZZZ_SESSION: null,

	});

	module.exports = appConstants;


/***/ },

/***/ 164:
/***/ function(module, exports, __webpack_require__) {

	/***

		DEVNOTE: need to change this to use websockets (i.e., true async as websockets have no response!)

	**/

	var // axios = require('axios')
		// , TxActions = require('../actions/zazzzTransactionActions')
		SocketHandler = __webpack_require__(165)
		;

	//console.dir(Object.keys(TxActions));

	module.exports = {
		
		getSessions: function() {
			SocketHandler.socket.emit('get-sessions');
		},
		
		getSingleSessions: function(_id) {
			SocketHandler.socket.emit('get-single-session', { id: _id });
		},

		markSessionFraudLevel: function(_id, fraud_level) {
			//MonitorSessionAPI.markSessionFraudLevel(_id, fraud_level);
			SocketHandler.socket.emit('mark-session', { session_id: _id, flag: fraud_level });
		},
		
		requestImage: function(params) {
			//MonitorSessionAPI.requestImage(_id);
			SocketHandler.socket.emit('capture-image', params);
		},
		
		startVideo: function(params) {
			//MonitorSessionAPI.startVideo(_id);
			SocketHandler.socket.emit('start-video', params);
		},
		
		stopVideo: function(params) {
			//MonitorSessionAPI.stopVideo(_id);
			SocketHandler.socket.emit('stop-video', params);
		},		
	};


/***/ },

/***/ 165:
/***/ function(module, exports, __webpack_require__) {

	/* set up websocket connection */
	var io = __webpack_require__(166)
		, socket_connected = false
		, barney_socket = io.connect()
		, debug = true
		, MonitorSessionActions = __webpack_require__(158)
		;

	// uncomment below to see verbose Socket.io logs
	//localStorage.debug = '*';

	barney_socket.on('connect', function() {
		socket_connected = true;
		/*
		if (socket_queue.length) {
			for (var i = 0; i < socket_queue.length; i += 1) {
				var Q = socket_queue[i];
				socket_handler(Q.action, Q.expects, Q.data, Q.cb);
			}
		}
		*/
	});

	var socket_handler = function(action, expects, data, cb) {
		
		console.log('[socket_handler]');
		console.log(action, expects, data);
		throw new Error('stop calling this I think!');
		
		if (action) {
			
			if (action == 'register-handler') {
				socket_callbacks[expects] = cb;

			} else if (action == 'unregister-handler') {
				if (socket_callbacks[expects]) {
					delete socket_callbacks[expects];
				}

			} else if (!socket_callbacks[expects]) {
				
				console.error('callback not registered for expects: '+expects);
				
			} else {
				//var cmd = { action: action, id: barney_socket._id, params: data };
				var cmd = { id: barney_socket._id, params: data };
				barney_socket.emit(action, cmd);
				console.log('socket sending command:');
				console.dir(cmd);
			}

		} else {
			console.error('socket handler requires an action');
		}

	}

	/*barney_socket.on('set-id', function(data) {
		barney_socket._id = data.id;
	});*/

	barney_socket.on('zazzz-verify', function(response) {
		console.log(' !!!!!!!!! zazzz-verify');
		console.log(response);
		push_single_session(response);
	});

	barney_socket.on('zazzz-tx-complete', function(response) {
		console.log(' !!!!!!!!! tx complete');
		console.log(response);
		push_single_session(response);
	});

	barney_socket.on('zazzz-session', function(response) {
		//console.log(' !!!!!!!!! inbound session');
		//console.log(response);
		push_single_session(response);
	});

	function push_single_session(response) {
		var data = response.data;
		if (response.status == 'err') {
			MonitorSessionActions.receiveSingleSession(response.msg || response.status);
			return false;
		} else if (!data || !data.session) {
			console.log('failed to parse inbound session data!');
			MonitorSessionActions.receiveSingleSession('failed to parse inbound session data!');
			return false;
		}
		
		MonitorSessionActions.receiveSingleSession(null, data.session);
	}

	barney_socket.on('session-list', function(response) {
		var data = response.data;
		if (data && data.sessions && data.sessions instanceof Array && data.sessions.length) {
			MonitorSessionActions.receiveSessionData(null, data.session);
		}
	});

	barney_socket.on('message', function(response) {
		console.log('general message from server:');
		console.log(response);
	});

	socket_handler.socket = barney_socket;

	module.exports = socket_handler;

/***/ },

/***/ 166:
/***/ function(module, exports) {

	module.exports = io;

/***/ },

/***/ 167:
/***/ function(module, exports, __webpack_require__) {

	var AppDispatcher = __webpack_require__(159)
		, appConstants = __webpack_require__(163)
		, objectAssign = __webpack_require__(21)
		, EventEmitter = __webpack_require__(168).EventEmitter
		, beep_snd = new Audio("/sound/chime-beep.mp3")
		, CHANGE_EVENT = 'zazzz_tx_change'

	// state vars:
		, _store = {
			sessions: []
		}

		;

	// keep them in date desc order:
	function order_sessions() {
		_store.sessions.sort(function compare(a,b) {
			if (a.creation_ts < b.creation_ts)
				return -1;
			if (a.creation_ts > b.creation_ts)
				return 1;
			return 0;
		});
		_store.sessions.reverse();
	}

	function setSessions(data) {
		_store.sessions = data;
		beep_snd.play();
		order_sessions();
	}

	function add_to_session_list(data) {
		if (!data || !data._id) {
			return false;
		}
		var exists = _store.sessions.filter(function(SH) {
			return SH._id == data._id;
		});
		if (exists && exists.length) {
			// merge with inbound???
			_store.sessions.forEach(function(tx, idx) {
				var checkme = JSON.stringify(_store.sessions[idx]);
				if (tx._id == data._id) {
					tx = objectAssign(tx, data);
					// not sure we need this, probably have a good reference but leave it for now:
					_store.sessions[idx] = tx;
					if (JSON.stringify(tx) != checkme) {
						beep_snd.play();
					}
				}
			});
		} else {
			_store.sessions.push(data);
			beep_snd.play();
		}
		order_sessions();
	}

	var MonitorSessionStore = objectAssign({}, EventEmitter.prototype, {
		addChangeListener: function(cb) {
			this.on(CHANGE_EVENT, cb);
		},

		removeChangeListener: function(cb) {
			this.removeListener(CHANGE_EVENT, cb);
		},
		
		emitChange: function() {
			this.emit(CHANGE_EVENT);
		},

		getSessions: function() {
			return _store.sessions;
		},

		getSingleSession: function(id) {
			var sesh = _store.sessions.filter(function(SH) {
				return SH._id == id;
			});
			if (sesh && sesh.length == 1) { return sesh.pop(); }
			return false;
		}
	});

	MonitorSessionStore.dispatch = AppDispatcher.register(function(payload){
		var action = payload.action;
		switch(action.actionType) {

			case appConstants.MARK_ZAZZZ_SESSION_CLOSED:
				if (action.data && typeof action.data == 'string') {
					_store.sessions.map(function(S) {
						if (S._id == action.data) { S.isClosed = true; }
					});
				}
				MonitorSessionStore.emitChange();
				break;

			case appConstants.MARK_ZAZZZ_SESSION_OPEN:
				if (action.data && typeof action.data == 'string') {
					_store.sessions.map(function(S) {
						if (S._id == action.data) { S.isClosed = false; }
					});
				}
				MonitorSessionStore.emitChange();
				break;

			case appConstants.GET_ZAZZZ_SESSIONS :
				console.log('GET_ZAZZZ_SESSIONS ..... action:');
				console.dir(action);
				if (action.data.data) {
					if (action.data.data) {
						setSessions(action.data.data);
					}
				}
				MonitorSessionStore.emitChange();
				break;

			case appConstants.GET_SINGLE_ZAZZZ_SESSION :
				if (action.data) {
					add_to_session_list(action.data);
				}
				MonitorSessionStore.emitChange();
				break;
			
			default:
				return true;
				break;
		}
	});

	module.exports = window.MSS = MonitorSessionStore;


/***/ },

/***/ 168:
/***/ function(module, exports) {

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

/***/ 169:
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
		;

	var VideoPlayer = React.createClass({displayName: "VideoPlayer",
		
		statics: {
			videoElement: null
		},
		
		componentDidMount: function() {
			
			var video, wrapper;
			wrapper = document.createElement('div');
			wrapper.innerHTML = "<video id='attachmentVideo' class='video-js vjs-default-skin' controls preload='auto' width='640' height='480' poster='' data-setup='{\"autoplay\": true, \"preload\": \"auto\", \"controls\": false }'><source src='" + this.props.url + "' type='rtmp/mp4' /><p className='vjs-no-js'>To view this video please enable JavaScript, and consider upgrading to a web browser that <a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a></p></video>";
			video = wrapper.firstChild;
			
			this.refs.target.getDOMNode().appendChild(video);
			//this.props.request_video();

			var player = videojs(video, {});

			// this fixes the "src not found" console error
			player.on('error', function(event) {
				if (player.error().code === 4) {
					player.error(null); // clear out the old error
					sources.shift(); // drop the highest precedence source
					player.src(sources); // retry
					return;
				}
			});
			
			this.videoElement = player;
		},

		componentWillUnmount: function() {
			this.props.stop_video();
			if (this.videoElement) {
				try {
					this.videoElement.pause();
					this.videoElement.dispose();
				} catch(e) {
					//console.log('failed to properly stop the video element, probably should not matter');
					//console.error(e);
				}
			}
		},

		render: function() {
			var titletag;
			if (this.props.zazzz && this.props.zazzz.location) {
				var stylez = {
					fontSize: '9px',
					fontStyle: 'italic'
				}
				titletag = (
					React.createElement("h5", null, "Video stream from ", this.props.zazzz.location.name, " ", React.createElement("span", {style: stylez}, "(", this.props.zazzz.location.address_line1, " ", this.props.zazzz.location.city, ", ", this.props.zazzz.location.state, ")"))
				);
			}
			return (
				React.createElement("div", {id: "attachmentViewer"}, 
					titletag, 
					React.createElement("div", {id: "attachmentVideoContainer", ref: "target"})
				)
			);
		}
	});

	module.exports = VideoPlayer;

/***/ }

});