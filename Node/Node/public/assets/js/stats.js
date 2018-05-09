let userScores = [];
let userID = 1;
function fillInSessionStats(){
    sessionQuizesMade = (JSON.parse(sessionStorage.getItem("sessionQuizzesMade")) || ["None"]);
    sessionQuizzesDone = (JSON.parse(sessionStorage.getItem("sessionQuizzesDone")) || ["None"]);
    sessionAvgScore = (JSON.parse(sessionStorage.getItem("sessionAvgScore")) || "Not available");
    console.log(typeof sessionQuizzesDone);
    $('#completedQuizes').html(sessionQuizzesDone.join(","));
    $('#quizzesMade').html(sessionQuizesMade.join(","));
    $('#avgScore').html(sessionAvgScore + "%");
}

$(document).ready(function(){
    fillInSessionStats();
});