var google = require('../src/google');

google.searchRandomImage('зомби', function (err, res) {
	console.log(err, res);
});