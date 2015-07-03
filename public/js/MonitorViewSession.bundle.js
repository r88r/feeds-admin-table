webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(1)
	//	, TransactionView = require('./components/ZaZZZ-TransactionView')
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
					React.createElement("p", null, React.createElement("a", {href: "/monitor/sessions", className: "button tiny", style: styles}, "« back to session list")), 
					React.createElement("h1", null, "Session Details"), 
					React.createElement("hr", null), 
	"//    ", React.createElement(TransactionView, {tx_id: window.ztx_id})
				)
			);
		}

	});

	React.render(
	  React.createElement(App, null),
	  document.getElementById('app')
	);


/***/ }
]);