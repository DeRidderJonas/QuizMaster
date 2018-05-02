function DisplayScore(){
  //get score from node
  let score = getParameterByName("score");
  let avgScore = getParameterByName("avgScore");
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

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function(){
  DisplayScore();
  DisplaySuggestions();
});
