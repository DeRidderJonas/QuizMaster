function DisplayScore() {
    let score = getParameterByName("score");
    let avgScore = getParameterByName("avgScore");
    $('#score').html(score);
    $('#avgScore').html(avgScore);
}

$(document).ready(function () {
    DisplayScore();
});
