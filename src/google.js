var google = require('googleapis');
var customsearch = google.customsearch('v1');
var CONF = require('config');
var _ = require('lodash');
var fs = require('fs');
var http = require('http');
var https = require('https');

module.exports.searchRandomImage = function (query, done) {
	customsearch.cse.list({
		cx: CONF.google.cx,
		q: query,
		auth: CONF.google.api_key,
		searchType: 'image'
	}, function (err, resp) {
		if (err) {
			console.log('An error occured', err);
			done(err);
		}
		// Got the response from custom search
		console.log('Result: ' + resp.searchInformation.formattedTotalResults);
		if (resp.items && resp.items.length > 0) {
			var index = Math.round(Math.random() * resp.items.length);
			var fileLink = resp.items[index].link;
			var fileName = 'images/' + fileLink.split('/').slice(-1)[0].split('?')[0];
			var file = fs.createWriteStream(fileName);
			console.log(index, fileLink, fileName);
			var h = fileLink.indexOf('https://') > -1 ? https : http;
			var request = h.get(fileLink, function (response) {
				response.pipe(file);
				file.on('finish', function () {
					file.close(function () {
						done(null, fileName);
					}); // close() is async, call cb after close completes.
				});
			}).on('error', function (err) { // Handle errors
				fs.unlink(fileName); // Delete the file async. (But we don't check the result)
				done(err);
			});
		} else {
			done('no results');
		}
	});
}