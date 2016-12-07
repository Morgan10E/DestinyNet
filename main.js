var api = new DestinyAPI("78cba77c96914777b028443feb5ee031");

var crawler = new NetworkCrawler(api.getSingleDataPoint, api.getNeighbors, function(player1, player2) { return player1.value > player2.value; });
crawler.setStartNode({id:"LeFey10e", value:0, data: {Name:"LeFey10e"}});
crawler.run(1);
