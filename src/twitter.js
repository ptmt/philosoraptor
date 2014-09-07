var util = require('util'),
  twitter = require('twitter'),
  Twitter = require('node-twitter'), //because of media uploads
  MsTranslator = require('mstranslator'),
  fs = require('fs'),
  _ = require('lodash'),
  S = require('string'),
  CONF = require('config'),
  textFilters = require('./textfilters'),
  google = require('./google');

var TWITTER_USER = 'prophetraptor',
  debug = process.env['NODE_ENV'] === 'development';

function TwitterRaptor() {
  this.twit = new twitter({
    consumer_key: CONF.twitter.consumer_key,
    consumer_secret: CONF.twitter.consumer_secret,
    access_token_key: CONF.twitter.access_token_key,
    access_token_secret: CONF.twitter.access_token_secret
  });

  this.bingClient = new MsTranslator({
    client_id: CONF.bing.client_id,
    client_secret: CONF.bing.client_secret
  });

  this.twitterRestClient = new Twitter.RestClient(
    CONF.twitter.consumer_key,
    CONF.twitter.consumer_secret,
    CONF.twitter.access_token_key,
    CONF.twitter.access_token_secret
  );

}

TwitterRaptor.prototype.startListenIncomingTweets = function () {
  console.log('starting listening incoming tweets..');
  var _this = this;
  this.twit.stream('user', {
    track: TWITTER_USER + '?replies=all'
  }, function (stream) {
    stream.on('data', function (data) {
      if (data.user && data.user.screen_name != TWITTER_USER) {
        if (data.retweeted_status) {
          console.log('fix retweet');
        } else {
          if (data.text.indexOf(TWITTER_USER) > -1 || (data.text.indexOf(TWITTER_USER) === -1 && Math.random() < 0.2))
            _this.makeSense(data.user.screen_name, data.text, _this.getTweetsForUser.bind(_this), function (finalAnswer, clearAnswer) {
              var inReplyToId = data.id_str;
              finalAnswer = finalAnswer.replace(data.user.screen_name, '');

              google.searchRandomImage(clearAnswer, function (err, res) {
                _this.postTweet('@' + data.user.screen_name + ' ' + finalAnswer,
                  inReplyToId,
                  res);
              });
            });
        }
      }
    });
  });
}

TwitterRaptor.prototype.getTweetsForUser = function (screenName, callback) {
  this.twit.get('/statuses/user_timeline.json', {
    screen_name: screenName,
    include_rts: false,
    exclude_replies: true,
    count: 1000
  }, function (data) {
    //fs.writeFile("mockdata.json", JSON.stringify(data));
    callback(data);
  });
};

TwitterRaptor.prototype.isAllowWord = function (word) {
  var bannedWords = ['https', 'http'];
  if (word.length < 4 || _.indexOf(bannedWords, word) > -1)
    return false;
  else
    return true;
};

TwitterRaptor.prototype.extractTopTenWords = function (tweets) {
  var natural = require('natural'),
    NGrams = natural.NGrams,
    tokenizer = new natural.AggressiveTokenizerRu(),
    _this = this;;
  var wordsDict = {};
  _.map(tweets, function (tweet) {
    _.map(tokenizer.tokenize(tweet),
      function (word) {
        word = word.trim();
        if (_this.isAllowWord(word)) {
          if (wordsDict.hasOwnProperty(word))
            wordsDict[word].value++;
          else
            wordsDict[word] = {
              word: word,
              value: 1
            };
        }
      });
  });
  var topTen = _.first(_.map(_.sortBy(wordsDict, function (item) {
    return -item.value;
  }), function (tweet) {
    return tweet.word;
  }), 10);

  return topTen;
};

/*
  too small dataset for using Bigram/trigram right now :(
function extractTrigram(tweets) {
  var natural = require('natural'),
    NGrams = natural.NGrams,
    tokenizer = new natural.AggressiveTokenizerRu();
  var trigramsDict = {};
  _.map(tweets, function (tweet) {
    _.map(NGrams.bigrams(tokenizer.tokenize(tweet)), function (trigramArray) {
      var trigram = trigramArray.join(' ');
      console.log(trigram);
      if (trigramsDict.hasOwnProperty(trigram))
        trigramsDict[trigram]++;
      else
        trigramsDict[trigram] = 0;
    });
  });

  var sorted = _.sortBy(trigramsDict, function (item) {
    return item;
  });
  console.log(_.first(sorted, 1));
}*/

TwitterRaptor.prototype.postTweet = function (statusText, replyToStatusId, media) {
  var twitterPayload = {
    status: statusText
  };
  if (replyToStatusId) {
    twitterPayload.in_reply_to_status_id = replyToStatusId;
  }
  if (media) {
    twitterPayload['media[]'] = media;
  }
  if (media) {
    this.twitterRestClient.statusesUpdateWithMedia(twitterPayload,
      function (error, result) {
        if (error) {
          console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
        }
      });
  } else {
    this.twitterRestClient.statusesUpdate(twitterPayload, function (err, data) {
      if (err) {
        console.error(err);
      }
    });
  }
}

TwitterRaptor.prototype.makeSense = function (twitterUser, text, basedOnTweetsFunc, callback) {

  var _this = this;
  var languages = ["ar", "bg", "ca", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "ht", "he", "hu", "id", "it", "ko", "lv", "lt", "no", "pl", "pt", "ro", "ru", "sk", "sl", "es", "sv", "th", "tr", "uk"];

  text = textFilters.cleanBeforeStart(text)
  // no mentions about raptor
  text = text.replace('@' + TWITTER_USER, '');

  basedOnTweetsFunc(twitterUser, function (tweets) {
    var tenWords = _this.extractTopTenWords(_.map(tweets, function (item) {
      return item.text;
    }));
    _this.text = text;
    _this.freezeTwitterArtifacts(); //hastags and usernames
    text = _this.freezed.text.toLowerCase().split(' ');
    // random words from tweets
    var textReplaces = [Math.round(Math.random() * text.length), Math.round(Math.random() * text.length)];
    var twitterReplaces = [Math.round(Math.random() * 10), Math.round(Math.random() * 10)];
    var skipWords = _.union(tenWords, text); // do not touch these words when text cleaning

    if (text.length > 4) {
      text[textReplaces[0]] = tenWords[twitterReplaces[0]];
      text[textReplaces[1]] = tenWords[twitterReplaces[1]];
    } else {
      text.push(tenWords[twitterReplaces[0]]);
      text.push(tenWords[twitterReplaces[1]]);
    }
    text = text.join(' ').toLowerCase();
    console.log(text);
    _this.bingClient.initialize_token(function (keys) {
      var i = 0;
      var fromLang = 'ru';
      var toLang = 'en';
      var totalCount = Math.round(Math.random() * 2 * 20) + 10;

      function translateOnceAgain(err, data) {
        if (data === null)
          console.log(err);

        data = textFilters.cleanBeforeContinue(data, skipWords, fromLang === 'ru');
        i++;
        var params = {
          text: data,
          from: fromLang,
          to: toLang
        };
        console.log(i, fromLang, toLang, err, data);
        if (i <= totalCount) {
          fromLang = toLang;
          toLang = i == (totalCount - 1) ? 'ru' : languages[Math.round(Math.random() * (languages.length - 1))];
          _this.bingClient.translate(params, translateOnceAgain);
        } else {
          data = textFilters.cleanBeforeContinue(data, skipWords, true);
          callback(_this.unfreezeTwitterArtifacts(data), data);
        }
      }
      translateOnceAgain(null, text); //first call
    });

  });
}

TwitterRaptor.prototype.freezeTwitterArtifacts = function () {

  var positions = [];
  var words = this.text.split(' ');
  for (var i = 0; i < words.length; i++) {
    // hashtags && twitter users
    if (words[i].indexOf('#') === 0 || words[i].indexOf('@') === 0) {
      positions.push({
        word: words[i],
        i: i
      });
      words[i] = '';
    }

  }
  console.log('freezed:', positions);
  this.freezed = {
    positions: positions,
    text: words.join(' ') // maybe tokenize better
  };
}

TwitterRaptor.prototype.unfreezeTwitterArtifacts = function (text) {
  var words = text.split(' ');

  _(this.freezed.positions).forEach(function (position) {
    console.log('insert ', position.word, ' into ', position.i);
    if (!words.indexOf(position.word))
      words.splice(position.i, 0, position.word);
  });

  return words.join(' ');
}

module.exports = TwitterRaptor;