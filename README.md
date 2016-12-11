1. Download the project, and write your custom API. If your custom API is in a separate Javascript file, ensure that it is included in index.html.
This is the structure DestinyNET expects for all of its node objects:
```json
{
  id: the identifying ‘name’ of this node,
  value: the value of the connection from the node we’re searching to this neighbor,
  data: (optional) a map of key-value pairs; these will be displayed in a tooltip above the node
}
```

2. Modify main.js to use your API. The code should look of the form:
```javascript
var crawler = new NetworkCrawler(
   neighborRetrievalFunction,
   priorityComparisonFunction
);
crawler.setStartNode(startNode);
crawler.run(numberIterations);
```
Where neighborRetrievalFunction and priorityComparisonFunction are user-defined functions that tap into the custom API written by the user.
..*neighborRetrievalFunction must accept two parameters: first, the node object whose neighbors are being retrieved; second, a callback function that is called with the array of neighbors as its parameter - this is how the network crawler receives the request.

..*priorityComparisonFunction must accept two parameters, which we will call nodeA and nodeB. priorityComparisonFunction returns true if nodeA should have higher priority for exploration than nodeB.
3. Set the start node. Give the crawler a node object to use as a starting point.
4. Run the crawler. Give the number of times you want it to explore the next highest priority node, or run(0) to only explore manually.
5. Host the web page (ie. python -m SimpleHTTPServer) to view the visualization.
