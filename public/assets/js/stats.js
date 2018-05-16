function fillInSessionStats() {
    sessionQuizesMade = (JSON.parse(sessionStorage.getItem("sessionQuizzesMade")) || ["None"]);
    sessionQuizzesDone = (JSON.parse(sessionStorage.getItem("sessionQuizzesDone")) || ["None"]);
    sessionAvgScore = (JSON.parse(sessionStorage.getItem("sessionAvgScore")) || "Not available");
    if(JSON.parse(sessionStorage.getItem("sessionAvgScore")) === 0)sessionAvgScore = 0;
    $('#completedQuizes').html(sessionQuizzesDone.join(","));
    $('#quizzesMade').html(sessionQuizesMade.join(","));
    if(sessionAvgScore !== "Not available")sessionAvgScore += "%";
    $('#avgScore').html(sessionAvgScore);
}

$(document).ready(function () {
    fillInSessionStats();
});