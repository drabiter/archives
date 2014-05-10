# Github-Times
Shows [Github Events](http://developer.github.com/v3/activity/events/types) and its associated repository's language charts.

### Client
Client side will request data from the server side by passing its 'data' parameter.

### Server
Server side written in [Node](http://nodejs.org/) will fetch compressed Github archive from local storage or [remote](http://www.githubarchive.org/). The archive will be extracted and processed. The result will be sent back to the client as data feed.

### Issue
Since a dedicated (and high performance) cloud can't be afforded in order to host the server, it's recommended to run it from local machine by installing NodeJS and execute

	$ node web.js

The client script is already pointed to `http://localhost:1337/` and only needs `data` parameter.

### Screenshots
<img src="http://i.imgur.com/5zGyaju.png" width="100" height="56" />
<img src="http://i.imgur.com/0xFZBtj.png" width="100" height="56" />
<img src="http://i.imgur.com/0m9MlvT.png" width="100" height="56" />
<img src="http://i.imgur.com/nhJz2ts.png" width="100" height="56" />
<img src="http://i.imgur.com/pWERfi2.png" width="100" height="56" />
<img src="http://i.imgur.com/O2Rg1CA.png" width="100" height="56" />

### Credits
* [Bespoke.js](https://github.com/markdalgleish/bespoke.js)
* [NodeJS](http://nodejs.org/)
* [Highchart](http://highcharts.com)
* [Request](https://github.com/mikeal/request/)