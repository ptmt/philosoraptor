var TwitterRaptor = require('../src/twitter');
var twitterRaptor = new TwitterRaptor();
var fs = require('fs');

function getTweets(username, callback) {
	callback(JSON.parse(fs.readFileSync('./test/mockdata.json')));
}

// twitterRaptor.makeSense(
// 	'potomushto',
// 	'@prophetraptor @potomushto #one #OneTwo @ev_ev adfa4c раз два три четыре, Kakâvstretilcf Nyjstabil Krasnyjslon  j ты» " "" "" "" "" "" "" "" "" "" "" "" "" ««# Хоккей Нико лук.»',
// 	getTweets,
// 	console.log);

// twitterRaptor.makeSense(
// 	'potomushto',
// 	'@prophetraptor @potomushto #one Вот тебе длинный длинный вопрос',
// 	getTweets,
// 	console.log);

twitterRaptor.postTweet('test', null, 'images/Zombie.jpg');