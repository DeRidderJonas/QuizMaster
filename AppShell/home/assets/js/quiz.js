function handleFormSubmit(e) {
  e.preventDefault();
  console.log(e.target.name);
  var answerId = e.target.name;
  $.ajax({
    type: "POST",
    url: '/handleAnswer',
    data: {sessionId: 0, quizId: 0, answerId: answerId},
    dataType: "json"
  }).done(function(data, textStatus, jqXHR){
    // new question will be returned
    fillInNewQuestion(questionData)
  }).fail(function(jqXHR, textStatus, errorThrown){
    console.error(errorThrown);
  });
}

function fillInNewQuestion(questionData){
  $('#question').html(questionData.question);
  $('input[name=answer1]').val(questionData.answer1);
  $('input[name=answer2]').val(questionData.answer2);
  $('input[name=answer3]').val(questionData.answer3);
  $('input[name=answer4]').val(questionData.answer4);
}

$(document).ready(function(){
  $('input[type=button]').on('click', handleFormSubmit);
  var q = {question: 'do i like trains?', answer1: 'wtf no', answer2: 'awww yeah', answer3: 'i like trains', answer4: 'wtf is this question'};
  fillInNewQuestion(q);
});
