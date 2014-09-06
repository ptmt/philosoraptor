/*
    Instagram philosoraptor.
    Brand new engine, separetad from twitter-based.
*/

var util = require('util'),
  twitter = require('twitter'),
  MsTranslator = require('mstranslator'),
  fs = require('fs'),
  _ = require('lodash'),
  CONF = require('config');


var INSTAGRAM_USER = 'prophetraptor',
  debug = process.env['NODE_ENV'] === 'development';

console.log(CONF);

var bingClient = new MsTranslator({
  client_id: CONF.bing.client_id,
  client_secret: CONF.bing.client_secret
});


var ig = require('instagram-node').instagram();
ig.use({
  client_id: CONF.instagram.client_id,
  client_secret: CONF.instagram.client_secret
});

ig.user_self_feed(function (err, medias, pagination, limit) {
  console.log(err, medias, pagination, limit);
});