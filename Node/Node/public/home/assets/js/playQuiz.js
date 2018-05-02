let questions;
let currentQuestion = 0;
let answers = [];
let quizID = 1;
let userID = 1;
function handleFormSubmit(e) {
  e.preventDefault();
  var answer = e.target.value;
  console.log(answer);
  answers.push(answer);
  currentQuestion++;
  if(currentQuestion < questions.length){
      fillInNewQuestion(questions[currentQuestion]);
  }else{
      if (userID !== null){
          $.ajax({
              type: "POST",
              url: '/handleAnswers',
              data: {userID: userID, quizID: quizID, answers: JSON.stringify(answers)}
          }).done(function(data, textStatus, jqXHR){
              //redirect to quizEnd.html
          }).fail(function(jqXHR, textStatus, errorThrown){
              console.error(errorThrown);
          });
      }

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
        console.log(data);
        questions = JSON.parse(data);
        fillInNewQuestion(questions[currentQuestion]);
    }).fail(function(jqXHR, textStatus, errorThrown){
        console.error(errorThrown);
    });
}

$(document).ready(function(){
    getQuestions(quizID);
    $('input[type=button]').on('click', handleFormSubmit);
});
