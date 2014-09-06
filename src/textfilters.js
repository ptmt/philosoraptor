var _ = require('lodash'),
  S = require('string');

// Array Remove - By John Resig (MIT Licensed)
module.exports.arrayRemove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

module.exports.cleanBeforeStart = function (str) {
  var d = S(str).replaceAll('?', '').replaceAll('RT:', '').replaceAll('rt:', '');
  return d.s;
};

var cleanText = function (s) {
  var toReplaceWithSpace = [':'];
  var toRemove = ['"', ' . ', "'", '»', '«', '""'];

  _(toReplaceWithSpace).forEach(function (symbol) {
    s = S(s).replaceAll(symbol, ' ').s;
  });
  _(toRemove).forEach(function (symbol) {
    s = S(s).replaceAll(symbol, '').s;

  });
  s = s.replace(/\s+/g, ' ');
  if (s.length > 140)
    s = s.slice(0, 139);
  return s;
};

module.exports.cleanBeforeContinue = function (str, skipWords, isRu) {
  var cyrillicTest = /[а-я]/i;
  var str = S(str).replaceAll('?', '').replaceAll(' .', '.').s;
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
  return cleanText(words.join(' '));
};