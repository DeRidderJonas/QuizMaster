let questions;
let currentQuestion = 0;
let answers = [];
function handleFormSubmit(e) {
  e.preventDefault();
  var answerId = e.target.name.substring(6,e.target.name.length);
  console.log(answerId);
  currentQuestion++;
  fillInNewQuestion(questions[currentQuestion]);
}

function fillInNewQuestion(questionData){
  $('#question').html(questionData.question);
  $('input[name=answer1]').val(questionData.answer1);
  $('input[name=answer2]').val(questionData.answer2);
  $('input[name=answer3]').val(questionData.answer3);
  $('input[name=answer4]').val(questionData.answer4);
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
    getQuestions(4);
    $('input[type=button]').on('click', handleFormSubmit);
});
