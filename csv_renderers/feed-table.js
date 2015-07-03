function csv_feeds(stats) {
	var csv_build = [];
	
	console.log('export csv feed data not supported yet!');
	return false;
	
	if (stats.length) {
		
		var labels = ['date', 'cart_id', 'total_revenue', 'customer_name', 'customer_address', 'items_purchased', 'machine'];
		
		// comma-delimted:
		csv_build.push('"' + labels.join('","') + '"');
		// tab-delimited
		//csv_build.push('"' + labels.join('"'+"\t"+'"') + '"');
		
		for (var i = 0; i < stats.length; i += 1) {
			var data = []
				, node = stats[i];
			
			data.push(node.data_blob.date);
			data.push(node.data_blob.cart_id);
			data.push(node.totals ? node.totals.total_spent.toFixed(2) : 'unknown??');
			data.push(node.user ? node.user.firstname + ' ' + node.user.lastname : 'unknown, id: '+node.user_id);
			data.push(node.user && node.user.billing_address ? node.user.billing_address.address_line1 + ', ' + node.user.billing_address.city + ', ' + node.user.billing_address.state : '');
			
			// comma-delimted:
			csv_build.push('"' + data.join('","') + '"');
			// tab-delimited
			//csv_build.push('"' + data.join('"'+"\t"+'"') + '"');
		}
		
		return csv_build.join("\n");
		
	} else {
		return false;
	}
	
}

module.exports = csv_feeds;