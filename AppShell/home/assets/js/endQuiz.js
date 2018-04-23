function DisplayScore(){
  //get score from node
  let score = 15;
  let avgScore = 17;
  $('#score').html(score);
  $('#avgScore').html(avgScore);
}

function DisplaySuggestions(){
  //get suggestions from node
  let suggestions = [{"name": "java", url:"index.html"}, {"name":"bla", url:"index.html"},
    {"name":"pudding", url:"index.html"},{"name":"scheep", url:"index.html"}];
  for (var i = 0; i < suggestions.length; i++) {
    $('#suggestion' + i).html("<a href='" + suggestions[i].url + "'>" + suggestions[i].name + "</a>");
  }
}

$(document).ready(function(){
  DisplayScore();
  DisplaySuggestions();
});
