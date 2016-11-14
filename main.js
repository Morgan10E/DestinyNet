var api = new DestinyAPI("78cba77c96914777b028443feb5ee031");
api.getMembershipID("lefey10e", function(response) {
  console.log(response);
  api.getActivity(response.membershipId, function(response2) {
    console.log(response2);
  });
});
