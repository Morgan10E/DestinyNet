var LocalAPI = function(filename) {
  this.filename = filename;
  console.log(this.filename);
};

// LocalAPI.prototype.DestinyHTTPRequest = function(url, callback) {
//   var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     // console.log(this);
//     if (this.readyState == 4 && this.status == 200) {
//       var results = JSON.parse(this.responseText);
//       if (results.ErrorCode == 1) {
//         // console.log("SUCCESSFUL REQUEST");
//         callback(results);
//       } else {
//         console.log("THERE WAS AN ERROR WITH REQUEST: " + url);
//         console.log(results.ErrorCode);
//         console.log(results.ErrorStatus);
//       }
//     } else {
//       // console.log("REQUEST NOT COMPLETED: " + url);
//     }
//   }

//   xhttp.open("GET", "https://www.bungie.net/Platform/Destiny/" + url, true);
//   xhttp.setRequestHeader("X-Api-Key", this.apiKey);
//   xhttp.send();
// };

// LocalAPI.prototype.getMembershipID = function(username, callback) {
//   this.DestinyHTTPRequest("SearchDestinyPlayer/2/" + username + "/", function(response) {
//     callback(response.Response[0]);
//   });
// };

// LocalAPI.prototype.getAccount = function(membershipID, callback) {
//   this.DestinyHTTPRequest("2/Account/" + membershipID + "/", function(response) {
//     callback(response.Response.data);
//   });
// };

// LocalAPI.prototype.getActivity = function(membershipID, count, callback) {
//   var self = this;
//   this.getAccount(membershipID, function(response) {
//     var characters = response.characters;
//     var activities = [];
//
//     async.each(characters, function(character, async_callback) {
//       self.DestinyHTTPRequest("Stats/ActivityHistory/2/" + membershipID + "/" + character.characterBase.characterId + "/?mode=None&count=" + count, function(response_c) {
//         var charActivities = response_c.Response.data.activities;
//         activities = activities.concat(charActivities);
//         async_callback();
//       });
//     }, function(err) {
//       if (err) {
//         console.log("Error getting activities for " + membershipID);
//       } else {
//         callback(activities);
//       }
//     });
//   });
// };

// LocalAPI.prototype.getRecentPlayers = function(membershipID, curVal, callback) {
//   var self = this;
//   this.getActivity(membershipID, 5, function(activityList) {
//     var playerMap = {};
//     async.each(activityList, function(activity, async_callback) {
//       self.DestinyHTTPRequest("Stats/PostGameCarnageReport/" + activity.activityDetails.instanceId + "/", function(response_a) {
//         var playerList = response_a.Response.data.entries;
//         // console.log(playerList);
//         playerList.forEach(function(playerEntry) {
//           // console.log(playerEntry);
//           if (playerEntry.player.destinyUserInfo.membershipId !== membershipID){
//             var displayName = playerEntry.player.destinyUserInfo.displayName;
//             if (playerMap[displayName] === undefined) {
//               playerMap[displayName] = {count: 0};
//             }
//             playerMap[displayName].count = playerMap[displayName].count + 1;
//           }
//         });
//         async_callback();
//       });
//     }, function(err) {
//       if (err) {
//         console.log("Error loading recent players for " + membershipID);
//       } else {
//         var playerList = [];
//         for (player in playerMap) {
//           playerList.push({id:player, value:playerMap[player].count, data: {Name:player, TimesPlayed: playerMap[player].count}});
//         }
//         callback(playerList);
//       }
//     });
//   });
// };

// LocalAPI.prototype.getNode = function(id, callback) {
//   d3.json(filename, function(error, graph) {
//     var nodes = graph.nodes;
//     for (var i = 0; i < nodes.length; i++) {
//       if (nodes[i].id == id) return nodes[i];
//     }
//   });
// };

LocalAPI.prototype.getNeighbors = function(charObject, callback) {
  console.log(this.filename);
  var name = charObject.id;
  d3.json("miserable.json", function(error, graph) {
    var links = graph.links;
    var nodes = graph.nodes;
    var neighbors = [];
    links.forEach(function(link) {
      if (link.source == name) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].id == name) {
            neighbors.push({id: link.target, value: link.value, data:{Name:link.target, Group:nodes[i].group}});
            break;
          }
        }
      }
      if (link.target == name) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].id == name) {
            neighbors.push({id: link.source, value: link.value, data:{Name:link.source, Group:nodes[i].group}});
            break;
          }
        }
      }
    });
    callback(neighbors);
  });
};

// LocalAPI.prototype.getSingleDataPoint = function(username, callback) {
//   this.getMembershipID("lefey10e", function(response) {
//     // console.log(response);
//     callback({id: response.displayName, data: {Name: response.displayName}})
//   });
// };
