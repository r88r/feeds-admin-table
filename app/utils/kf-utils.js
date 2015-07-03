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