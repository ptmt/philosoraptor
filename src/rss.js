//http://news.yandex.ru/index.rss

var FeedParser = require('feedparser')
  , request = require('request');

module.exports.getLastNews = function(done) {
  var req = request('http://news.yandex.ru/index.rss')
    , feedparser = new FeedParser();

  req.on('error', function (error) {
    done(error);
  });
  req.on('response', function (res) {
    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
  });

  var items = [];

  feedparser.on('error', function(error) {
    done(error);
  });

  feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this
      , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
      , item;

    while (item = this.read()) {
      items.push(item.title);
    }
  });

  feedparser.on('end', function() {
    console.log(items[0]);
    done(null, items);
  });

}
