/*
Data Retriever: gets information on a single item
  Params:
    query (the data they need for their API to get the data)
    callback (the function that will be called after the data has been retrieved; assumes that data is processed by user and provides at least 'id')
Neighbor Retriever: gets all of the neighbors
  Params:
    originNode (the node we are getting the neighbors of)
    callback (called after neighbors retrieved; assumes they are an array of objects with at least 'id' and 'value' defined)
Priority Comparison: used by the priority queue to determine search order
  Params:
    two node objects (the data they contain will have at least 'id', otherwise defined by user)
*/

var NetworkCrawler = function(dataRetrievalFunc, neighborRetrieverFunc, priorityComparisonFunc) {
  this.dataRetriever = dataRetrievalFunc;
  this.neighborRetriever = neighborRetrieverFunc;
  this.priorityQueue = new PriorityQueue(priorityComparisonFunc);
  this.vizData = {"nodes": [], "links": []};
  // this.dataExtractor = extractIDandDataFunc;

  this.svg = d3.select("svg");
  var width = +this.svg.attr("width"),
  height = +this.svg.attr("height");

  this.simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(d) { return 100/d.value; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  this.simulation.alphaTarget(0.1).restart();

  this.linkG = this.svg.append("g").attr("class", "links");
  this.nodeG = this.svg.append("g").attr("class", "nodes");
};

// var api = new DestinyAPI("78cba77c96914777b028443feb5ee031");

NetworkCrawler.prototype.addNeighbors = function(originNode) {
  var self = this;
  this.neighborRetriever(originNode, function(response) {
    response.forEach(function(nodeObject) {
      if (!self.containsNode(nodeObject)) {
        self.vizData.nodes.push(nodeObject);
        self.priorityQueue.enqueue(nodeObject);
      }
      if ((i = self.indexOfLink(nodeObject.id, originNode.id)) !== -1) {
        if (nodeObject.value < self.vizData.links[i].value) {
          self.vizData.links[i].value = nodeObject.value;
        }
      } else {
        self.vizData.links.push({"source": originNode.id, "target": nodeObject.id, "value": nodeObject.value});
      }
    });

    self.update();
  });
};

// function getData(query) {
//   this.dataRetriever(query, function(response) {
//
//   });
  // api.getMembershipID(username, function(response) {
  //   console.log(response);
  //   // playerData.nodes.push({"id": response.displayName, "group": 0});
  //   api.getRecentPlayers(response.membershipId, function(response2) {
  //     console.log(response2);
  //     for (var player in response2) {
  //       var count = response2[player].count;
  //       if (!containsNode(player)) {
  //         playerData.nodes.push({"id": player, "group": count});
  //         playerQueue.enqueue({username: player, count: count});
  //       }
  //       if ((i = indexOfLink(player, response.displayName)) !== -1) {
  //         if (count < playerData.links[i].value) {
  //           playerData.links[i].value = count;
  //         }
  //       } else {
  //         playerData.links.push({"source": response.displayName, "target": player, "value": count});
  //       }
  //     };
  //     update(playerData);
  //   });
  // });
// }

NetworkCrawler.prototype.setStartQuery = function(query, callback) {
  var self = this;
  this.dataRetriever(query, function(startNode) {
    // var startNode = self.dataExtractor(response);
    self.vizData.nodes.push(startNode);
    self.priorityQueue.enqueue(startNode);
    callback(startNode);
  });
};

NetworkCrawler.prototype.setStartNode = function(startNode) {
  this.vizData.nodes.push(startNode);
  this.priorityQueue.enqueue(startNode);
}

NetworkCrawler.prototype.run = function(numSteps) {
  var counter = numSteps;
  var self = this;
  var interval = setInterval(function(){
    console.log("INTERVAL: " + counter + ", queue length: " + self.priorityQueue.length());
    if (counter > 0 && self.priorityQueue.length() > 0) {
      var nextPlayer = self.priorityQueue.dequeue();
      self.addNeighbors(nextPlayer);
      counter--;
    } else if (counter === 0) {
      clearInterval(interval);
    }

    // update(playerData);
  }, 5000);
};

NetworkCrawler.prototype.update = function() {
  // var self = this;
  var graph = this.vizData;
  console.log(graph);
  console.log(this.priorityQueue);

  var updateLink = this.linkG
    .selectAll("line")
    .data(graph.links);
  var link = updateLink.enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var updateNode = this.nodeG
    .selectAll("circle")
    .data(graph.nodes);
  var node = updateNode.enter().append("circle")
      .attr("r", 5)
      .call(d3.drag()
          .on("start", this.dragstarted)
          .on("drag", this.dragged)
          .on("end", this.dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.id });

  this.simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  this.simulation.force("link")
      .links(graph.links);

  function ticked() {
    link.merge(updateLink)
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.merge(updateNode)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function dragstarted(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  // });
};

NetworkCrawler.prototype.dragstarted = function(d) {
  // if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
};

NetworkCrawler.prototype.dragged = function(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
};

NetworkCrawler.prototype.dragended = function(d) {
  // if (!d3.event.active) this.simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
};

// getData("lefey10e");
// playerData.nodes.push({"id": "LeFey10e", "group": 0});


NetworkCrawler.prototype.containsNode = function(newNode) {
  for (var i = 0; i < this.vizData.nodes.length; i++) {
    if (this.vizData.nodes[i].id === newNode.id) {
      return true;
    }
  }
  return false;
};

NetworkCrawler.prototype.indexOfLink = function(source, target) {
  for (var i = 0; i < this.vizData.links.length; i++) {
    if (this.vizData.links[i].source === source && this.vizData.links[i].target === target) {
      return i;
    }
  }
  return -1;
};
// update(playerData);
// function update() {
//   console.log(graph);
//   var nodes = g.selectAll("nodes").data(graph.nodes);
//   var links = g.selectAll("links").data(graph.links);
// }