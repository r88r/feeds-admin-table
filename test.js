var keyMirror = require('react/lib/keyMirror');

console.log('does it exist???');
console.log(keyMirror);

process.exit(1);


var foo
	, mongodb = require("mongodb")
	, objectid = mongodb.BSONPure.ObjectID
;

console.log(objectid);
console.dir( Object.keys(objectid) );
console.log( objectid.ObjectID('54c8ea1ff172339214c1684c') )
