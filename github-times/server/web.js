var http = require('http'), 
	url = require('url'), 
	zlib = require("zlib"),
	request = require('request'),
	fs = require('fs');

// Limit the number of languages
var LIMIT = 20;

var URL = "http://data.githubarchive.org/";

var EVTS_0 = [
    'CommitCommentEvent',
    'CreateEvent',
    'DeleteEvent',
    'DownloadEvent',
    'FollowEvent',
    'ForkEvent'
];

var EVTS_1 = [
	'ForkApplyEvent',
    'GistEvent',
    'GollumEvent',
    'IssueCommentEvent',
    'IssuesEvent',
    'MemberEvent'
];

var EVTS_2 = [
	'PublicEvent',
    'PullRequestEvent',
    'PullRequestReviewCommentEvent',
    'PushEvent',
    'TeamAddEvent',
    'WatchEvent'
];

http.createServer(function (req, res) {

	// Retrieve the parameter
	var param = url.parse(req.url, true).query['data'];

	if (param){
		// Found parameter
		var buf = '';
		var langEvent = {};
		var langCnt = {};
		var _lang = {};
		var langSum = 0;
		var eventCnt = {};
		var eventSum = 0;

		fs.exists(param + '.cache', function(exists){
			if (exists){
				// Use cache result
				console.log('exist');
				fs.readFile(param + '.cache', function(err, data){
					endResponse(res, data);
				});
			}else if (param.substring(param.length - 3) == ".gz"){
				console.log('not exist');

				// There are 2 ways to get the zipped JSON: 
				// 1) by fetching from github archieve in production mode or
				// 2) from reading local storage in dev mode since fetching could take a while and need server
				// comment/uncomment one of these lines below
				
				var inp = request(URL + param); // Retrieve new json.gz from githubarchieve (prod)
				// var inp = fs.createReadStream(param); // Retrieve from local storage (dev)
				
				var gunzip = zlib.createGunzip();
				var r = inp.pipe(gunzip);
				r.on('data', function(d){
					onRawJSON(d);
				});
				r.on('end', function(){
					var output = JSON.stringify({
						'status':'ok',
						'langCnt': sortObjectAsArray(langCnt),
						'eventCnt': sortArrayAsArray(eventCnt),
						'langEvent1': encode(langEvent, EVTS_0),
						'langEvent2': encode(langEvent, EVTS_1),
						'langEvent3': encode(langEvent, EVTS_2),
						'eventSum': eventSum,
						'langSum': langSum,
						"eventOrder1": EVTS_0,
						"eventOrder2": EVTS_1,
						"eventOrder3": EVTS_2
					});
					fs.writeFile(param + '.cache', output);
					endResponse(res, output);
				});
			}else{
				// Use testing json (development)
				console.log('not gz');
				var inp = fs.createReadStream(param);
				inp.on('data', function(d){
					onRawJSON(d);
				});
				inp.on('end', function(){
					console.log(langCnt.length);
					var output = JSON.stringify({
						'status':'ok',
						'langCnt': sortObjectAsArray(langCnt),
						'eventCnt': sortArrayAsArray(eventCnt),
						'langEvent1': encode(langEvent, EVTS_0),
						'langEvent2': encode(langEvent, EVTS_1),
						'langEvent3': encode(langEvent, EVTS_2),
						'eventSum':eventSum,
						'langSum':langSum,
						"eventOrder1": EVTS_0,
						"eventOrder2": EVTS_1,
						"eventOrder3": EVTS_2
					});
					fs.writeFile(param + '.cache', output);
					endResponse(res, output);
				});
			}
		});

		function onRawJSON(data){
			buf += data.toString(); // when data is read, stash it in a string buffer
			pump(); // then process the buffer
		}

		function pump() {
			var pos;

		    while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
		        if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
		            buf = buf.slice(1); // discard it
		            continue; // so that the next iteration will start with data
		        }
		        process(buf.slice(0,pos)); // hand off the line
		        buf = buf.slice(pos+1); // and slice the processed data off the buffer
		    }
		}

		function process(line) { // here's where we do something with a line
			if (line[line.length-1] == '\r'){
		    	line=line.substr(0,line.length-1); // discard CR (0x0D)
		    }

		    if (line.length > 0) { // ignore empty lines
		        var obj = JSON.parse(line); // parse the JSON
		        displayJSON(obj); // Got one valid event JSON
		    }
		}

		function displayJSON(data){
			var type = data.type;
			var lang = null;
			if (data.repository){
				if (data.repository.language){
					lang = data.repository.language;
				}
			}

			// Count events' occurence
			if (type in eventCnt){
				eventCnt[type]++;
				eventSum++;
			}else if (type != null){
				eventCnt[type] = 1;
				eventSum++;
			}

			if (lang != null){
				// Count numbers of involved language
				if (lang in langCnt){
					langCnt[lang]++;
					langSum++;
				}else{
					langCnt[lang] = 1;
					langSum++;
				}

				// Log relation between events and languages
				if (lang in langEvent){
					if (type in langEvent[lang]){
						langEvent[lang][type]++;
					}else{
						langEvent[lang][type] = 1;
					}
				}else{
					langEvent[lang] = {};
				}
			}
		}

		function endResponse(r, data){
			r.writeHead(200, {'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*"});
			console.log('======================this is called======================');
			r.end(data);
		}
	}else{
		// No parameter/query found, return empty json
		console.log('no param');
		res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
		var output = JSON.stringify({
				'status':'empty'
			});
		res.end(output);
	}

}).listen(1337, '127.0.0.1');

// Run the server
console.log('Server running at http://127.0.0.1:1337/');

function sortObjectAsArray(obj){
	return sortObjectAsArray(obj, function(a, b) { return b.y - a.y; });
}

// Transform object to array of property's name and its value pair object
function sortObjectAsArray(obj, sorter, sortY) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        	var y;
        	if (sortY) y = sortArrayAsArray(obj[prop], function(a, b){ return a[0].localeCompare(b[0]); });
        	else y = obj[prop];
            arr.push({
                'name': prop,
                'y': y
            });
        }
    }
    arr.sort(sorter);
    if (arr.length > LIMIT) arr.length = LIMIT;
    return arr;
}

function sortArrayAsArray(obj){
	return sortArrayAsArray(obj, function(a, b) { return b[1] - a[1]; });
}

// Transform object to array of property's name and its value pair array
function sortArrayAsArray(obj, sorter) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        	arr.push([prop, obj[prop]]);
        }
    }
    arr.sort(sorter);
    if (arr.length > LIMIT) arr.length = LIMIT;
    return arr;
}

function encode(rawLangEvent, eventOrder){
	var chunk = [];
	for (var prop in rawLangEvent){
		if (rawLangEvent.hasOwnProperty(prop)) {
			var data = [];
			var v = rawLangEvent[prop];
			for (var i = 0; i < eventOrder.length; i++){
				if (eventOrder[i] in v){
					data.push(v[eventOrder[i]]);
				}else data.push(0);
			}
			chunk.push({
				'name': prop,
				'data': data
			});
		}
	}
	return chunk;
}