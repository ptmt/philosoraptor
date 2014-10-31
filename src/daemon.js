/* global __dirname */
var cronJob = require('cron').CronJob,
  news = require('./rss'),
  TwitterRaptor = require('../src/twitter'),
  google = require('./google');

var twitterRaptor = new TwitterRaptor();

var getCorpus = twitterRaptor.getTweetsForUser.bind(twitterRaptor);

function postTweet(text) {
  console.log('postTweet:', text);
  google.searchRandomImage(text, function (err, res) {
    twitterRaptor.postTweet(text, null, res);
  });
}

console.log('starting background job');

new cronJob('0 0 */12 * * *', function() {
  news.getLastNews(function(err, text) {
    twitterRaptor.makeSense(
      'lentaruofficial',
      text[0],
      getCorpus,
      postTweet);
  });
}, false, true);
