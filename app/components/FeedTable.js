var React = require('react')
//	, SocketHandler = require('../utils/SocketHandler')
	, FixedDataTable = require('fixed-data-table')
	, Table = FixedDataTable.Table
	, Column = FixedDataTable.Column
	, ColumnGroup = FixedDataTable.ColumnGroup
	
	, table_setup // definition at end of component

	;


var muDB=function(e){e=e||null;if(e!==null){this.setDB(e)}return this};muDB.prototype={db:{},cb:null,curpath:null,setDB:function(e){this.db=e},getDB:function(){return this.db},addObserver:function(e){this.cb=e},notify:function(e,t){if(this.cb){this.cb(e,this.curpath,t)}},expand:function(e){if(typeof e=="object"&&e!==null&&e.toString().indexOf("[object HTML")==-1){for(var t in e){e[t]=this.expand(e[t])}}else if(typeof e=="string"){if(e.charAt(0)=="$"){e=this.expand(this.get(e.slice(1)))}}return e},get:function(e,t){data=this.search(e);if(data==null){if(e.charAt(0)=="$"){e=e.slice(1);data=this.search(e)}if(data==null){return null}}if(typeof data==="string"){if(data.charAt(0)=="$"){e=data.slice(1);data=this.search(e)}}if(t==undefined){t=true}if(t){data=this.expand(data)}return data},set:function(e,t,n,r){n=n||false;this.curpath=e||null;e=e.split(".");this._set(this.db,e,t,n);this.notify("set",r)},search:function(e,t){t=t||false;e=e.split(".");return this._search(this.db,e,t)},filter:function(e,t,n,r){e=this.checkObjRef(e);r=r||-1;if(typeof n=="string"&&n.indexOf("%%")>-1){return this._fuzzyFilter(e,t,n.substr(0,n.length-2),r)}if(n===null){return this._nullFilter(e,t,r)}var i=[];if(e instanceof Array){if(e.length){for(var s=0;s<e.length;s+=1){if(this._search(e[s],t.split("."))==n){i.push(e[s])}if(r>-1&&i.length>=r){break}}}}else{for(var o in e){if(e.hasOwnProperty(o)){var u=this._search(e[o],t.split("."));if(u&&u==n){if(r===-1||i.length<r){i.push(e[o])}}}}}if(i.length){return i}return null},findOne:function(e,t,n){var r=this.filter(e,t,n,1);if(r&&r.length){return r[0]}return null},keyExists:function(e,t){e=this.checkObjRef(e);if(e.hasOwnProperty(t)){return true}return false},checkObjRef:function(e){e=e||null;if(e!==null){e=typeof e=="string"?this.get(e):e}else{e=this.db}return e},del:function(e,t){this.curpath=e||null;e=e.split(".");return this._del(this.db,e);this.notify("del",t)},_set:function(e,t,n,r){key=t.shift();if(e.hasOwnProperty(key)){if(t.length==0){if(r&&typeof n==="object"){for(k in n){e[key][k]=n[k]}}else{e[key]=n;return}}else{this._set(e[key],t,n,r)}}else{if(t.length==0){e[key]=n}else{e[key]={};this._set(e[key],t,n,r)}}},_search:function(e,t,n){var r=t.shift();if(e!==undefined&&e.hasOwnProperty(r)){if(t.length==0){if(n)return e;return e[r]}return this._search(e[r],t,n)}return null},_nullFilter:function(e,t,n){var r=[];if(e instanceof Array){if(e.length){for(var i=0;i<e.length;i+=1){if(this._search(e[i],t.split("."))){r.push(e[i])}if(n>-1&&r.length>=n){break}}}}else{for(var s in e){if(e.hasOwnProperty(s)){if(this._search(e[s],t.split("."))){if(n===-1||r.length<n){r.push(e[s])}}}}}if(r.length){return r}return null},_fuzzyFilter:function(e,t,n,r){var i=[];if(e instanceof Array){if(e.length){for(var s=0;s<e.length;s+=1){var o=this._search(e[s],t.split("."));if(o){if(o.toLowerCase().indexOf(n)>-1){i.push(e[s])}}if(r>-1&&i.length>=r){break}}}}else{for(var u in e){if(e.hasOwnProperty(u)){var o=this._search(e[u],t.split("."));if(o&&o.toLowerCase().indexOf(n)>-1){if(r===-1||i.length<r){i.push(e[u])}}}}}if(i.length){return i}return null},_del:function(e,t){key=t.shift();if(e.hasOwnProperty(key)){if(t.length==0){delete e[key];return true}else{this._del(e[key],t)}}else if(e[key]){if(t.length==0){delete e[key];return true}else{this._del(e[key],t)}}else{return false}}}

/**********

FixedDataTablePaths
** requires muDB

function(
  cellData: any,
  cellDataKey: string,
  rowData: object,
  rowIndex: number,
  columnData: any,
  width: number
): ?$jsx

****/
var FixedDataTableDB = function() {
	var args = Array.prototype.slice.call(arguments);
	console.log('try to find '+args[1]+' ... current val: '+args[0]);
	if (args[0] === undefined && typeof args[1] === 'string' && typeof args[2] === 'object') {
		return new muDB(args[2]).get(args[1]);
	}
	console.log('didnot find it, returning original val');
	return args[0];
}

FixedDataTableDB.objectify = function(args) {
	return {
		cellData: args[0],
		cellDataKey: args[1],
		rowData: args[2],
		rowIndex: args[3],
		columnData: args[4],
		width: args[5]
	}
}

var RenderSpecialCell = function() {
	var args = Array.prototype.slice.call(arguments)
		, params = FixedDataTableDB.objectify(args);

	switch (args[1]) {
		case 'webpage':
			var url = params.cellData || '';
			var shorted = url.replace('http://','').replace('https://','').replace('www.','').split('/')[0];
			return (<a href={url} target="_blank">{shorted}</a>)
			break;

		case 'avatar':
			var url = params.cellData || '';
			var twpage = 'http://twitter.com/' + args[2].name;
			return <a href={twpage} target="_blank"><img src={url} width="32"/></a>
			break;

		case 'hl':
			var url = "http://webapp.e4.r88r.net/v3/stories_by_oid?oids=" + params.rowData.oid; // + "&pretty=1";
			return <a href={url} target="_blank">{params.cellData}</a>
			break;
		
		default:
			return FixedDataTableDB(arguments);
			break;
	}
	
	
}

var FeedsTable = React.createClass({
	
	statics: {
		componentWidth: false
	},
	
	getInitialState: function() {
		return {
			feeds: []
		};
	},
	
	componentWillMount: function() {
	},
	
	componentDidMount: function() {
		this.componentWidth = React.findDOMNode(this).offsetWidth;
		window.addEventListener('resize', this.wResize);
	},
	
	componentDidUpdate: function() {
		if (JSON.stringify(this.state.feeds) !== JSON.stringify(this.props.feeds)) {
			this.setState({
				feeds: this.props.feeds
			});
		}
	},
	
	componentWillUnmount: function() {
		window.removeEventListener('resize', this.wResize);
	},

	wResize: function() {
		this.componentWidth = React.findDOMNode(this).offsetWidth;
		this.forceUpdate();
		/*
		this.setState({
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight
		});
		*/
	},
	
	render: function() {
		
		if (this.state.feeds && this.state.feeds.length) {
			
			/*return (
				<p>render the feeds!</p>
			);*/

			var feeds = this.state.feeds // shorter ref
				, width = this.componentWidth
				, height = this.state.windowHeight * 0.75
				;
			
			// testing:
			height = 500;

			function rowGetter(rowIndex) {
				return feeds[rowIndex];
			}
			
			var cgroups = Object.keys(table_setup.groups)
				, ColumnGroups = [];
			
			cgroups.forEach(function(CGk, cgIDX) {
				
				var CG = table_setup.groups[CGk];
				
				var COLUMNS = CG.columns.map(function(COL, cIDX) {
					var cellRenderer = null;
					if (COL.customComponent) {
						switch (typeof COL.customComponent) {
							
							case 'function':
								cellRenderer = COL.customComponent;
								break;
							
							default:	// truthy
								//cellRenderer = FixedDataTableDB;
								// instead, example of how to customize.... just pass through to FDTDB
								cellRenderer = RenderSpecialCell;
								
								break;
						}
						
					}
				
					var fixed = cgIDX == 0;
				
					return (
						<Column
							key={"col-"+cIDX}
							align="left"
							label={COL.displayName}
							width={COL.width || 100}
							minWidth={COL.minWidth || 50}
							maxWidth={COL.maxWidth || 150}
							dataKey={COL.dataKey}
							isResizeable={true}
							fixed={fixed}
							cellRenderer={cellRenderer}
						/>
					);
				});

				var CGROUP = (
					<ColumnGroup
						key={"cg-"+cgIDX}
						align="center"
						label={CG.displayName}
					>{COLUMNS}</ColumnGroup>
				);
						//fixed={(cgIDX == 0)}
				
				ColumnGroups.push(CGROUP);
			});
			
			return (
				<div>
					<h5>{this.props.query} Feeds for Namespace={this.props.current_namespace}</h5>
				  <Table
					rowHeight={36}
					rowGetter={rowGetter}
					rowsCount={feeds.length}
					width={width}
					maxHeight={height}
					headerHeight={80}
					scrollTop={0}
					scrollLeft={0}
					overflowX="auto"
					overflowY="auto"
					>
					{ColumnGroups}
					</Table>
				</div>
			);
			
		} else {
			
			var $MSG = '';

			/*
			if (this.props.current_namespace) {
				$MSG = (<p>Loading {this.props.current_namespace} feeds</p>)
			}
			*/
		
			return (
				<div>
					<h6>Feeds Table</h6>
					{$MSG}
				</div>
			);
					//<pre>{JSON.stringify(this.state, null, 4)}</pre>
		}
    }

});

module.exports = FeedsTable;

table_setup = {
	groups: {
		project_data: {
			displayName: "Project Data",
			columns: [
				{
					dataKey: "cname",
					displayName: "Context Name",
					width: 200,
					minWidth: 200,
					maxWidth: 200
				},
				{
					dataKey: "admin_owner",
					displayName: "Admin Owner"
				},
				{
					dataKey: "feed_label",
					displayName: "Feed Label"
				},
				{
					dataKey: "client_id",
					displayName: "Client ID"
				},
				{
					dataKey: "project_id",
					displayName: "Project ID"
				},
			]
		},

		feed_tech_data: {
			displayName: "Feed Tech Data",
			columns: [
				{
					dataKey: "formats",
					displayName: "Feed Format"
				},
				{
					dataKey: "package",
					displayName: "Feed Package"
				},
				{
					dataKey: "index_bool",
					displayName: "Index?"
				},
				{
					dataKey: "monitor_priority",
					displayName: "Monitor Priority"
				},
				{
					dataKey: "crawled_bool",
					displayName: "Crawled?"
				},
				{
					dataKey: "endpoints.rss",
					displayName: "RSS URL"
				},
				{
					dataKey: "endpoints.json",
					displayName: "JSON URL"
				},
			]
		},

		monitoring_data: {
			displayName: "Monitoring Data",
			columns: [
				{
					dataKey: "endpoint_errors",
					displayName: "Endpoint Error Codes"
				},
				{
					dataKey: "task_status",
					displayName: "Task Status"
				},
				{
					dataKey: "story_age_now",
					displayName: "Most Recent Story Age - Now (mins)"
				},
				{
					dataKey: "story_age_24hrs",
					displayName: "Most Recent Story Age - 24 Hrs Ago (mins)"
				},
				{
					dataKey: "story_age_7days",
					displayName: "Most Recent Story Age - 7 Days Ago (mins)"
				},
				{
					dataKey: "stories_built_24rs",
					displayName: "Stories Built - 24 Hrs Ago"
				},
				{
					dataKey: "stories_built_7days",
					displayName: "Stories Built - 7 Days Ago"
				},
				{
					dataKey: "feed.task_id",
					displayName: "Task ID",
					customComponent: FixedDataTableDB
				},
				{
					dataKey: "stories_built_url",
					displayName: "Stories Built Chart"
				},
			]
		},

		feed_development: {
			displayName: "Feed Development",
			columns: [
				{
					dataKey: "clear_context_api",
					displayName: "Clear Context Script"
				},
				{
					dataKey: "rerun_feed_api",
					displayName: "Rerun Feed Script"
				},
				{
					dataKey: "rss_headlines_api",
					displayName: "RSS Headlines Script"
				},
			]
		},

		feed_development2: {
			displayName: "Feed Development 2",
			columns: [
				{
					dataKey: "search_query",
					displayName: "Search Query String"
				},
				{
					dataKey: "search_num_results",
					displayName: "Search, # of Results"
				},
				{
					dataKey: "search_num_days",
					displayName: "Search, # of Days"
				},
				{
					dataKey: "search_similar_threshold",
					displayName: "Search, Sim Threshold"
				},
				{
					dataKey: "streams_url",
					displayName: "Streams Search URL"
				},
				{
					dataKey: "twitter_list",
					displayName: "Twitter List"
				},
			]
		},
	}
}
