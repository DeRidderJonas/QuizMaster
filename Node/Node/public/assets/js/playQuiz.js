let questions;
let currentQuestion = 0;
let answers = [];
let quizID = 1;
let quizTitle = "Quizeroni maccaroni";
let userID = 1;
console.log(typeof sessionStorage.getItem("sessionQuizzesDone"));
function handleFormSubmit(e) {
  e.preventDefault();
  var answer = e.target.value;
  console.log(answer);
  answers.push(answer);
  currentQuestion++;
  if(currentQuestion < questions.length){
      fillInNewQuestion(questions[currentQuestion]);
  }else{
      $.ajax({
          type: "POST",
          url: '/handleAnswers',
          data: {userID: userID, quizID: quizID, answers: JSON.stringify(answers)}
      }).done(function(data, textStatus, jqXHR){
          data = JSON.parse(data);
          let sessionQuizzesDone = (JSON.parse(sessionStorage.getItem("sessionQuizzesDone")) || []);
          let sessionAvgScore = (JSON.parse(sessionStorage.getItem("sessionAvgScore")) || 0);
          console.log("avgScoreBefore", sessionAvgScore, "questions:", questions, "data.score", data.score);
          if(sessionQuizzesDone.length === 0){
              sessionAvgScore = (data.score/questions.length*100);
          }else{
              sessionAvgScore = (sessionAvgScore + (data.score)/questions.length*100)/2
          }
          console.log("avgScoreAfter", sessionAvgScore);
          sessionQuizzesDone.push(quizTitle);
          sessionStorage.setItem("sessionQuizzesDone", JSON.stringify(sessionQuizzesDone));
          sessionStorage.setItem("sessionAvgScore", JSON.stringify(sessionAvgScore));
          window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf("quiz.html")) + "quizEnd.html?quiz=" + quizID
              + "&score=" + data.score + "&avgScore=" + data.avgScore;
      }).fail(function(jqXHR, textStatus, errorThrown){
          console.error(errorThrown);
          $('#question').html("Sorry, Your score could not be validated due to connetion issues. Try again later");
          $('.answers').html("Check your connection to the internet.");
      });
  }

}

function fillInNewQuestion(questionData){
  $('#question').html(questionData.question);
  $('input[name=answer1]').val(questionData.answer0);
  $('input[name=answer2]').val(questionData.answer1);
  $('input[name=answer3]').val(questionData.answer2);
  $('input[name=answer4]').val(questionData.answer3);
}

function getQuestions(quizID){
    $.ajax({
        type: "POST",
        url: "/getQuestionsForQuiz",
        data: {quizID: quizID},
        dataType: "json"
    }).done(function (data) {
        data = JSON.parse(data);
        questions = data.questions;
        quizTitle = data.title;
        fillInNewQuestion(questions[currentQuestion]);
        $('#quizTitle').html(quizTitle);
    }).fail(function(jqXHR, textStatus, errorThrown){
        console.error(errorThrown);
        if(db.dbAvailable()){
            db.getQuestionsForQuiz(parseInt(quizID))
                .then(qs=>questions=qs)
                .then(_=>fillInNewQuestion(questions[currentQuestion]))
                .catch(err=>console.error(err));
            db.getQuizTitle(quizID).then(title=>quizTitle=title);
            $('#quizTitle').html(quizTitle);
        }else{
            $('#question').html("Something went wrong, try again later...")
        }
    });
}

$(document).ready(function(){
    quizID = getParameterByName("quiz");
    getQuestions(quizID);
    $('input[type=button]').on('click', handleFormSubmit);
});

