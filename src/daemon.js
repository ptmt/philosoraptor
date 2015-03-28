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

console.log('starting writer job');

news.getLastNews(function(err, text) {
  twitterRaptor.makeSense(
    'lentaruofficial',
    text[0],
    getCorpus,
    postTweet);
});
