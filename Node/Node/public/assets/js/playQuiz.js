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
      $.ajax({
          type: "POST",
          url: '/handleAnswers',
          data: {userID: userID, quizID: quizID, answers: JSON.stringify(answers)}
      }).done(function(data, textStatus, jqXHR){
          data = JSON.parse(data);
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
        console.log(data);
        questions = JSON.parse(data);
        fillInNewQuestion(questions[currentQuestion]);
    }).fail(function(jqXHR, textStatus, errorThrown){
        console.error(errorThrown);
        if(db.dbAvailable()){
            db.getQuestionsForQuiz(parseInt(quizID))
                .then(qs=>questions=qs)
                .then(_=>fillInNewQuestion(questions[currentQuestion]))
                .catch(err=>console.error(err))
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

