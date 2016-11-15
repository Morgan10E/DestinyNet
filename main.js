var api = new DestinyAPI("78cba77c96914777b028443feb5ee031");

var playerData = {"nodes": [], "links": []};

api.getMembershipID("lefey10e", function(response) {
  console.log(response);
  playerData.nodes.push({"id": response.displayName, "group": 0});
  api.getRecentPlayers(response.membershipId, function(response2) {
    console.log(response2);
    for (var player in response2) {
      var count = response2[player].count;
      playerData.nodes.push({"id": player, "group": count});
      playerData.links.push({"source": response.displayName, "target": player, "value": count});
    };
    update(playerData);
  });
});

d3.interval(function(){ update(playerData); }, 5000);

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(d) { return 100 - 10*d.value; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var linkG = svg.append("g").attr("class", "links");
var nodeG = svg.append("g").attr("class", "nodes");

function update(graph) {
    console.log(graph);

    var updateLink = linkG.selectAll("line")
      .data(graph.links);
    var link = updateLink.enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var updateNode = nodeG.selectAll("circle")
      .data(graph.nodes);
    var node = updateNode.enter().append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.group); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.id; });

    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.id });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
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
  // });
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// update(playerData);
// function update() {
//   console.log(graph);
//   var nodes = g.selectAll("nodes").data(graph.nodes);
//   var links = g.selectAll("links").data(graph.links);
// }
