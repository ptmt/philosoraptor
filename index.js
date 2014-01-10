var util = require('util'),
  twitter = require('twitter'),
  MsTranslator = require('mstranslator'),
  fs = require('fs'),
  _ = require('lodash');


var TWITTER_USER = 'prophetraptor',
  debug = process.env['NODE_ENV'] === 'development';
var twit = new twitter({
  consumer_key: 'VE7fixgfdaswpvPBlsKuw', // you can try
  consumer_secret: 'LPSfhVgSA0lFqVC2tHRxVdagzI4csS1rSbFi0gJbL68',
  access_token_key: '1629668064-FWmO5QpI6QbuCkbtU1L4s7wi1iTVKoAWMPA4VPB',
  access_token_secret: 'q7djQdCJN8ApJeM3yqk06b2Iyt0fFPNoN8tP19kZilcIz'
});

var bingClient = new MsTranslator({
  client_id: "philosophoraptor",
  client_secret: "J8G078YXhuODZ1NSpIy/7h0agazoWleK6vHy7PG7RWQ="
});


if (debug)
  makeSense('potomushto', '@potomushto @prophetraptor раз два три четыре, пять шесть', console.log);
else
  startListenIncomingTweets();

function startListenIncomingTweets() {
  console.log('starting listening incoming tweets..');
  twit.stream('user', {
    track: TWITTER_USER + '?replies=all'
  }, function (stream) {
    stream.on('data', function (data) {

      if (data.user && data.user.screen_name != TWITTER_USER) {
        if (data.retweeted_status)
          console.log('fix retweet');
        else
          makeSense(data.user.screen_name, data.text, function (finalAnswer) {
            postTweet('@' + data.user.screen_name + ' ' + finalAnswer, data.id);
          });

      }
    });

    //setTimeout(stream.destroy, 25000);
  });
}

function getTweetsForUser(screenName, callback) {
  if (debug)
    callback(mockDate());
  else {
    twit.get('/statuses/user_timeline.json', {
      screen_name: screenName,
      include_rts: false,
      exclude_replies: true,
      count: 1000
    }, function (data) {
      fs.writeFile("mockdata.json", JSON.stringify(data));
      callback(data);
    });
  }
}

function mockDate() {
  return JSON.parse(fs.readFileSync('mockdata.json'));
}

function isAllow(word) {
  var bannedWords = ['https', 'http'];

  if (word.length < 4 || _.indexOf(bannedWords, word) > -1)
    return false;
  else
    return true;
}

function extractTopTenWords(tweets) {
  var natural = require('natural'),
    NGrams = natural.NGrams,
    tokenizer = new natural.AggressiveTokenizerRu();
  var wordsDict = {};
  _.map(tweets, function (tweet) {
    _.map(tokenizer.tokenize(tweet),
      function (word) {
        word = word.trim();
        if (isAllow(word)) {
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
}

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

function postTweet(statusText, replyToStatusId) {
  twit
    .verifyCredentials(function (data) {
      console.log('credentionals verified');
    })
    .updateStatus(statusText, {
        'in_reply_to_status_id': replyToStatusId
      },

      function (data) {
        console.log(data.text);
      }
  );
}

function makeSense(twitterUser, text, callback) {

  var languages = ["ar", "bg", "ca", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "ht", "he", "hu", "id", "it", "ko", "lv", "lt", "no", "pl", "pt", "ro", "ru", "sk", "sl", "es", "sv", "th", "tr", "uk"];

  text = text.cleanBeforeStart();
  // no mentions about raptor
  text = text.replace('@' + TWITTER_USER, '');

  getTweetsForUser(twitterUser, function (tweets) {
    var tenWords = extractTopTenWords(_.map(tweets, function (item) {
      return item.text;
    }));

    text = text.split(' '); //.slice(1, text.length);
    var textReplaces = [Math.round(Math.random() * text.length), Math.round(Math.random() * text.length)];
    var twitterReplaces = [Math.round(Math.random() * 10), Math.round(Math.random() * 10)];
    var skipWords = [tenWords[twitterReplaces[0]], tenWords[twitterReplaces[1]]];
    console.log(textReplaces, twitterReplaces, tenWords);
    if (text.length > 4) {
      text[textReplaces[0]] = tenWords[twitterReplaces[0]];
      text[textReplaces[1]] = tenWords[twitterReplaces[1]];
    } else {
      text.push(tenWords[twitterReplaces[0]]);
      text.push(tenWords[twitterReplaces[1]]);
    }
    text = text.join(' ').toLowerCase();

    if (debug)
      callback(text);
    else {
      bingClient.initialize_token(function (keys) {



        var i = 0;
        var fromLang = 'ru';
        var toLang = 'en';
        var totalCount = Math.round(Math.random() * 2 * 20) + 10;

        function translateOnceAgain(err, data) {

          data = data.cleanBeforeContinue(skipWords, fromLang === 'ru');
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

            bingClient.translate(params, translateOnceAgain);


          } else {
            callback(data.cleanBeforeSubmit());
          }

        }

        translateOnceAgain(null, text); //first call
      });
    }



  });
}

String.prototype.cleanBeforeStart = function () {
  var d = this.replace('?', '').replace('RT:', '').replace('rt:', '');
  return d;
};

String.prototype.cleanBeforeContinue = function (skipWords, isRu) {
  var cyrillic = /[а-я]/i;
  var str = this.replace('?', '').replace(' .', '.');
  str = str.trim();
  var words = str.split(' ');
  for (var i = 0; i < words.length; i++) {
    // hashtags
    if (words[i].indexOf('#') > -1) words[i] = words[i].toLowerCase();

    // detect not cyrillic words
    if (isRu && skipWords.indexOf(words[i]) > -1 && !cyrillic.test(str)) {
      console.log('not cyrillic, remove it');
      words[i] = '';
    }

    // check for links, do not touch instagram
    if ((words[i].indexOf('http') > -1 && words[i].indexOf('insta') === -1) || words[i].indexOf('t.co') > -1)
      words[i] = '';

  }

  return words.join(' ');
};

String.prototype.cleanBeforeSubmit = function () {
  var s = this.trim().replace(' . ', '').replace('"', '').replace("'", "").replace(':', ' ');
  if (s.length > 140)
    s = s.slice(0, 139);
  return s;
};