let userScores = [];
let userID = 1;
function fillInSessionStats(){
    sessionQuizesMade = (JSON.parse(sessionStorage.getItem("sessionQuizzesMade")) || ["None"]);
    sessionQuizzesDone = (JSON.parse(sessionStorage.getItem("sessionQuizzesDone")) || ["None"]);
    console.log(typeof sessionQuizzesDone);
    $('#completedQuizes').html(sessionQuizzesDone.join(","));
    $('#quizzesMade').html(sessionQuizesMade.join(","));
}

$(document).ready(function(){
    fillInSessionStats();
});