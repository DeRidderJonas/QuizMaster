
var currentAmountOfQuestions = 0;

function addQuestion(e) {
  if(e){
    e.preventDefault();
  }
  currentAmountOfQuestions++;
  $('input[name=amountOfQuestions]').val(currentAmountOfQuestions);
  var html = `
  <fieldset>
    <label for="question${currentAmountOfQuestions}">Question ${currentAmountOfQuestions}</label>
    <input type="text" name="question${currentAmountOfQuestions}" id="question${currentAmountOfQuestions}" class="Titlequestion">
    <section class="answerPool">
      <article class="answerCol">
        <label for="answer${currentAmountOfQuestions}_1">Answer 1</label>
        <input type="text" name="answer${currentAmountOfQuestions}_1" id="answer${currentAmountOfQuestions}_1">
        <label for="answer${currentAmountOfQuestions}_3">Answer 3</label>
        <input type="text" name="answer${currentAmountOfQuestions}_3" id="answer${currentAmountOfQuestions}_3">
      </article>
      <article class="answerCol">
        <label for="answer${currentAmountOfQuestions}_2">Answer 2</label>
        <input type="text" name="answer${currentAmountOfQuestions}_2" id="answer${currentAmountOfQuestions}_2">
        <label for="answer${currentAmountOfQuestions}_4">Answer 4</label>
        <input type="text" name="answer${currentAmountOfQuestions}_4" id="answer${currentAmountOfQuestions}_4">
      </article>
    </section>
  </fieldset>
  `
  $('#questions').append(html);
};

$(document).ready(function(){
  addQuestion();
  $('#addQuestion').on('click', addQuestion);
});
