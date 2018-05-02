let userScores = [];
let userID = 1;
let showingQuizNames = true;
let showingMadeQuizzes = true;
function fillInUserScores(){
    $.ajax({
        type: "POST",
        url: '/getUserScores',
        data: {userID: userID}
    }).done(function(data, textStatus, jqXHR){
        userScores = JSON.parse(data);
        console.log(userScores);
        let avgScore = 0;
        userScores.completedQuizes.forEach(q=>avgScore+= q.score);
        avgScore = avgScore/userScores.completedQuizes.length;
        $('#averageScore').html(avgScore);
        toggleQuizNames();
        toggleQuizzesMade();
    }).fail(function(jqXHR, textStatus, errorThrown){
        console.error(errorThrown);
    });
}

function toggleQuizNames() {
    showingQuizNames = !showingQuizNames;
    if (showingQuizNames){
        let html = '<ul>';
        userScores.completedQuizes.forEach(q=>html += `<li>${q.name}: ${q.score}</li>`);
        html+= '</ul>';
        $('#completedQuizes').html(html);
    }else{
        $('#completedQuizes').html(userScores.completedQuizes.length);
    }
}

function toggleQuizzesMade() {
    showingMadeQuizzes = !showingMadeQuizzes;
    if  (showingMadeQuizzes){
        let html = '<ul>';
        userScores.quizzesMade.forEach(q=>html += `<li>${q.name}: ${q.description} ${q.tags ? '('+q.tags+')' : '' } Average score: ${q.avgScore}`);
        html += '</ul>';
        $('#quizzesMade').html(html);
    }else{
        $('#quizzesMade').html(userScores.quizzesMade.length);
    }
}

$(document).ready(function(){
   fillInUserScores();
   $("#showQuizNames").on('click', toggleQuizNames);
   $('#showQuizzesMade').on('click', toggleQuizzesMade);
});