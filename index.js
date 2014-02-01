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

String.prototype.replaceAll = function (find, replace) {
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }
  return this.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

String.prototype.cleanBeforeStart = function () {
  var d = this.replace('?', '').replaceAll('RT:', '').replaceAll('rt:', '');
  return d;
};

String.prototype.cleanText = function () {
  var toReplaceWithSpace = [':'];
  var toRemove = ['"', ' . ', "'", '»', '«', '""'];
  var s = this;

  _(toReplaceWithSpace).forEach(function (symbol) {
    s = s.replaceAll(symbol, ' ');
  });
  _(toRemove).forEach(function (symbol) {
    s = s.replaceAll(symbol, '');

  });
  s = s.replace(/\s+/g, ' ');
  if (s.length > 140)
    s = s.slice(0, 139);
  return s;
};

String.prototype.cleanBeforeContinue = function (skipWords, isRu) {
  var cyrillicTest = /[а-я]/i;
  var str = this.replace('?', '').replaceAll(' .', '.');
  str = str.trim();
  str = str.replace(/\s+/g, ' ');
  var words = str.split(' ');

  for (var i = 0; i < words.length; i++) {

    // detect not cyrillic words
    if (isRu && skipWords.indexOf(words[i].toLowerCase()) === -1 && !cyrillicTest.test(words[i])) {
      console.log(words[i], 'not cyrillic, remove it');
      words[i] = '';
    }

    // check for links, do not touch instagram TODO: not working because t.co
    if ((words[i].indexOf('http') > -1 && words[i].indexOf('insta') === -1) || words[i].indexOf('t.co') > -1)
      words[i] = '';


  }


  return words.join(' ').cleanText();
};



if (debug)
  makeSense('potomushto', '@prophetraptor @potomushto #one #OneTwo @ev_ev adfa4c раз два три четыре, Kakâvstretilcf Nyjstabil Krasnyjslon  j ты» " "" "" "" "" "" "" "" "" "" "" "" "" ««# Хоккей Нико лук.»', console.log);
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
        else {
          if (data.text.indexOf(TWITTER_USER) > -1 || (data.text.indexOf(TWITTER_USER) === -1 && Math.rand() < 0.1))


            makeSense(data.user.screen_name, data.text, function (finalAnswer) {
              var inReplyToId = data.id_str;
              finalAnswer = finalAnswer.replace(data.user.screen_name, '');
              postTweet('@' + data.user.screen_name + ' ' + finalAnswer, inReplyToId);
            });
        }


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

    var freezedData = freezeTwitterArtifacts(text);
    text = freezedData.text.toLowerCase();
    text = text.split(' ');
    // extract and store hashtags and screen names

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

    if (debug == -1)
      callback(text.cleanBeforeContinue([], true).cleanText());
    else {
      bingClient.initialize_token(function (keys) {



        var i = 0;
        var fromLang = 'ru';
        var toLang = 'en';
        var totalCount = Math.round(Math.random() * 2 * 20) + 10;

        function translateOnceAgain(err, data) {
          if (data === null)
            console.log(err);

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
            callback(unfreezeTwitterArtifacts(data.cleanBeforeContinue(skipWords, true), freezedData.positions));
          }

        }

        translateOnceAgain(null, text); //first call
      });
    }



  });
}

function freezeTwitterArtifacts(text) {

  var positions = [];
  var words = text.split(' ');
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
  return {
    positions: positions,
    text: words.join(' ') // maybe tokenize better
  };
}

function unfreezeTwitterArtifacts(text, artifacts) {
  var words = text.split(' ');

  _(artifacts).forEach(function (position) {
    console.log('insert ', position.word, ' into ', position.i);
    if (!words.indexOf(position.word))
      words.splice(position.i, 0, position.word);

  });

  return words.join(' ');
}
