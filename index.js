var util = require('util'),
  twitter = require('twitter'),
  MsTranslator = require('mstranslator');

var TWITTER_USER = 'academ_swag';
var twit = new twitter({
  consumer_key: 'VE7fixgfdaswpvPBlsKuw',
  consumer_secret: 'LPSfhVgSA0lFqVC2tHRxVdagzI4csS1rSbFi0gJbL68',
  access_token_key: '1629668064-FWmO5QpI6QbuCkbtU1L4s7wi1iTVKoAWMPA4VPB',
  access_token_secret: 'q7djQdCJN8ApJeM3yqk06b2Iyt0fFPNoN8tP19kZilcIz'
});

var bingClient = new MsTranslator({
  client_id: "philosophoraptor",
  client_secret: "J8G078YXhuODZ1NSpIy/7h0agazoWleK6vHy7PG7RWQ="
});


function postTweet(statusText, replyToStatusId) {
  twit
    .verifyCredentials(function (data) {
      console.log(util.inspect(data));
    })
    .updateStatus(statusText, {
        'in_reply_to_status_id': replyToStatusId
      },

      function (data) {
        console.log(util.inspect(data));
      }
  );
}

twit.stream('user', {
  track: TWITTER_USER + '?replies=all'
}, function (stream) {
  stream.on('data', function (data) {
    if (data.user && data.user.screen_name != TWITTER_USER) {

      console.log(data.user.id, data.text);
      makeSense(data.text, function (finalAnswer) {
        postTweet('@' + data.user.screen_name + ' ' + finalAnswer, data.id);
      });

    }
  });

  setTimeout(stream.destroy, 25000);
});


function makeSense(text, callback) {

  var languages = ["ar", "bg", "ca", "zh-CHS", "zh-CHT", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "ht", "he", "hi", "hu", "id", "it", "ja", "ko", "lv", "lt", "no", "pl", "pt", "ro", "ru", "sk", "sl", "es", "sv", "th", "tr", "uk", "vi"];


  text = text.replace('?', '');
  bingClient.initialize_token(function (keys) {

    var i = 0;
    var fromLang = 'ru';
    var toLang = 'en';
    var totalCount = 3;

    function translateOnceAgain(err, data) {
      i++;
      var params = {
        text: data,
        from: fromLang,
        to: toLang
      };
      console.log(i, fromLang, toLang, err, data);
      if (i <= totalCount) {
        fromLang = toLang;
        toLang = i == totalCount - 1 ? 'ru' : languages[Math.round(Math.random() * languages.length)];
        // setTimeout((function () {
        bingClient.translate(params, translateOnceAgain);
        //}), 2000);

      } else
        callback(data);

    }

    translateOnceAgain(null, text);

  });
}