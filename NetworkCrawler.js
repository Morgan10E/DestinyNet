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

  this.div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  this.priorityList = d3.select("#priorityList");

  this.simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(d) { return 100/d.value; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  this.simulation.alphaTarget(0.001).restart();

  this.container = this.svg.append("g");//.attr("position", "absolute").attr("width", "100%").attr("height","100%");
  this.linkG = this.container.append("g").attr("class", "links");
  this.nodeG = this.container.append("g").attr("class", "nodes");

  var self = this;
  var zoom = d3.zoom()
    .scaleExtent([0.001, 10])
    .on("zoom", function(d) { self.zoomed(d, self); });

  this.svg.call(zoom);

  this.tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    var htmlString = "";
    for (key in d.data) {
      htmlString = htmlString + "<strong>" + key + ":</strong> " + d.data[key] + "<br>";
    }
    return htmlString;//"<strong>Name:</strong> <span style='color:red'>" + d.id + "</span>";
  });

  this.svg.call(this.tip);
  // this.priorityList.call(this.tip);
};

// var api = new DestinyAPI("78cba77c96914777b028443feb5ee031");

NetworkCrawler.prototype.addNeighbors = function(originNode) {
  var self = this;
  originNode['searched'] = 1;
  self.update();
  this.neighborRetriever(originNode, function(response) {
    // async.each(response, function(nodeObject, async_callback) {
    //   if (!self.containsNode(nodeObject)) {
    //     self.vizData.nodes.push(nodeObject);
    //     self.priorityQueue.enqueue(nodeObject);
    //   }
    //   if ((i = self.indexOfLink(nodeObject.id, originNode.id)) !== -1) {
    //     if (nodeObject.value > self.vizData.links[i].value) {
    //       self.vizData.links[i].value = nodeObject.value;
    //     }
    //   } else {
    //     self.vizData.links.push({"source": originNode.id, "target": nodeObject.id, "value": nodeObject.value});
    //   }
    //   self.addConnectionsBetweenNeighbors(nodeObject, self, function() { self.update(); });
    // }, function(err) {
    //   self.update();
    // });
    response.forEach(function(nodeObject) {
      if (!self.containsNode(nodeObject)) {
        nodeObject['searched'] = 0;
        self.vizData.nodes.push(nodeObject);
        self.priorityQueue.enqueue(nodeObject);
      }
      if ((i = self.indexOfLink(nodeObject.id, originNode.id)) !== -1) {
        if (nodeObject.value > self.vizData.links[i].value) {
          self.vizData.links[i].value = nodeObject.value;
        }
      } else {
        self.vizData.links.push({"source": originNode.id, "target": nodeObject.id, "value": nodeObject.value});
      }
    });

    self.update();

    self.addConnectionsBetweenNeighbors(response, self, originNode);
  });
};

NetworkCrawler.prototype.addConnectionsBetweenNeighbors = function(newNeighbors, self, originNode) {
  async.each(newNeighbors, function(neighbor, async_callback) {
    self.neighborRetriever(neighbor, function(response) {
      response.forEach(function(nodeObject) {
        if (self.containsNode(nodeObject)) {
          if ((i = self.indexOfLink(nodeObject.id, neighbor.id)) !== -1) {
            if (nodeObject.value > self.vizData.links[i].value) {
              self.vizData.links[i].value = nodeObject.value;
            }
          } else {
            self.vizData.links.push({"source": neighbor.id, "target": nodeObject.id, "value": nodeObject.value});
          }
        }
      });
      self.update();
      async_callback();
    });
  }, function(err) {
    originNode['searched'] = 2;
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
  this.update();
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
  var self = this;
  var graph = this.vizData;
  // console.log(graph);
  // console.log(this.priorityQueue);

  var updateLink = this.linkG
    .selectAll("line")
    .data(graph.links);
  var link = updateLink.enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var updateNode = this.nodeG
    .selectAll("circle")
    .data(graph.nodes);
  var node = updateNode.enter().append("circle")
      .attr("class", "node")
      .attr("id", function(d) { return d.id; })
      .attr("r", 5)
      .call(d3.drag()
        .on("start", function(d) { self.dragstarted(d, self); })
        .on("drag", function(d) { self.dragged(d, self); })
        .on("end", function(d) { self.dragended(d, self); }))
      .on('mouseover', function(d) {
        self.tip.show(d);
        console.log(d);
        self.priorityList.select("#" + d.id).classed("highlighted", true);
      })
      .on('mouseout', function(d) {
        self.tip.hide(d);
        self.priorityList.select("#" + d.id).classed("highlighted", false);
      })
      .on('click', function(d) { self.clicked(d, self); })
    .merge(updateNode)
      .attr('fill', function(d) {
        if (d.searched == 1) {
          return 'green';
        }
        if (d.searched == 2) {
          return 'blue';
        }
      });

  node.append("title")
      .text(function(d) { return d.id; });

  var ul = this.priorityList.selectAll(".priorityListItem")
    .data(this.priorityQueue.queue);
  // ul.attr("class", "priorityListItem updated");

  ul.enter()
    .append("div")
    .attr("class", "priorityListItem")
    .on('mouseover', function(d) {
      var highlightedNode = self.nodeG.select("#" + d.id).transition().attr("fill", "red");
      // console.log(d);
      // self.tip.show(d, highlightedNode);
    })
    .on('mouseout', function(d) {
      var highlightedNode = self.nodeG.select("#" + d.id).transition().delay(1000).duration(5000).attr("fill", "black");
      // self.tip.hide(d);
    })
    .on('click', function(d) { self.clicked(d, self); })
  .merge(ul)
    .attr("id", function(d) { return d.id; })
    .html(function(d, i) { return (i+1) + ". " + d.id; })
  ul.exit().remove();

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

  // function dragstarted(d) {
  //   if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
  //   d.fx = d.x;
  //   d.fy = d.y;
  // }
  // });
};

NetworkCrawler.prototype.dragstarted = function(d, crawler) {
  if (!d3.event.active) crawler.simulation.alphaTarget(0.3).restart();
  // console.log(crawler);
  d.fx = d.x;
  d.fy = d.y;
};

NetworkCrawler.prototype.dragged = function(d, crawler) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
};

NetworkCrawler.prototype.dragended = function(d, crawler) {
  if (!d3.event.active) crawler.simulation.alphaTarget(0.001);
  d.fx = null;
  d.fy = null;
};

NetworkCrawler.prototype.zoomed = function(d, crawler) {
  console.log(d3.event);
  crawler.container.attr("transform", d3.event.transform);
  // gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  // gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
  // crawler.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

NetworkCrawler.prototype.clicked = function(d, crawler) {
  console.log("CLICKED " + d.id);
  crawler.priorityQueue.remove(function(item) {
    return item.id == d.id;
  });
  crawler.addNeighbors(d);
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
