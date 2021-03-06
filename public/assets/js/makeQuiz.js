let currentAmountOfQuestions = 0;
let offlineMadeQuizzes = [];

function addQuestion(e) {
    if (e) {
        e.preventDefault();
    }
    currentAmountOfQuestions++;
    $('input[name=amountOfQuestions]').val(currentAmountOfQuestions);
    let html = `
  <fieldset>
    <label for="question${currentAmountOfQuestions}">Question ${currentAmountOfQuestions}</label>
    <input type="text" name="question${currentAmountOfQuestions}" id="question${currentAmountOfQuestions}" class="Titlequestion">
    <section class="answerPool">
      <article class="answerCol">
        <label for="answer${currentAmountOfQuestions}_1">Right answer</label>
        <input type="text" name="answer${currentAmountOfQuestions}_1" id="answer${currentAmountOfQuestions}_1">
        <label for="answer${currentAmountOfQuestions}_3">Wrong answer</label>
        <input type="text" name="answer${currentAmountOfQuestions}_3" id="answer${currentAmountOfQuestions}_3">
      </article>
      <article class="answerCol">
        <label for="answer${currentAmountOfQuestions}_2">Wrong answer</label>
        <input type="text" name="answer${currentAmountOfQuestions}_2" id="answer${currentAmountOfQuestions}_2">
        <label for="answer${currentAmountOfQuestions}_4">Wrong answer</label>
        <input type="text" name="answer${currentAmountOfQuestions}_4" id="answer${currentAmountOfQuestions}_4">
      </article>
    </section>
  </fieldset>
  `;
    $('#questions').append(html);
}

function handleSubmit(e) {
    let questions = [];
    for (let i = 1; i < currentAmountOfQuestions + 1; i++) {
        let newQuestion = {
            "question": document.getElementById("question" + i).value,
            "rightAnswer": document.getElementById("answer" + i + "_1").value,
            "wrongAnswer1": document.getElementById("answer" + i + "_2").value,
            "wrongAnswer2": document.getElementById("answer" + i + "_3").value,
            "wrongAnswer3": document.getElementById("answer" + i + "_4").value,
        };
        questions.push(newQuestion)
    }
    let quiz = {
        "title": document.getElementById("quizTitle").value,
        "description": document.getElementById("quizDesc").value,
        "questions": questions
    };
    $.ajax({
        url: '/makeQuiz',
        data: {"quiz": JSON.stringify(quiz)},
        type: "post"
    }).done(function (data) {
        if (JSON.parse(data).status === "OK") $('#info').html("Your quiz was successfully added.")
    }).catch(function (err) {
        console.log(err);
        if (db.dbAvailable()) {
            db.newQuiz(quiz);
            $('#info').html("No connection to the server, try again later... (don't worry, your quiz was stored)");
            fillInOfflineMadeQuizzes();
        }
    });
    let sessionQuizzesMade = JSON.parse(sessionStorage.getItem("sessionQuizzesMade")) || [];
    sessionQuizzesMade.push(quiz.title);
    sessionStorage.setItem("sessionQuizzesMade", JSON.stringify(sessionQuizzesMade));
}

function fillInOfflineMadeQuizzes() {
    $('#madeOffline').html("");

    while (!db.dbAvailable()) {
    }
    db.getNewQuizzes()
        .then(quizzes => {
        quizzes.forEach(quiz => {
            $('#madeOffline').append(`<h2>${quiz.title}(${quiz.description})</h2>`);
            offlineMadeQuizzes.push(quiz);
        });
        $('#madeOffline').append("<button class=\"pushOfflineMade\">Send quizzes to server!</button>")
    }).catch(); 

}

function pushOfflineMade() {
    console.log("pushing offline made quizzes");
    offlineMadeQuizzes.forEach(quiz => {
        $.ajax({
            url: '/makeQuiz',
            data: {"quiz": JSON.stringify(quiz)},
            type: "post"
        }).done(function (data) {
            data = JSON.parse(data);
            if (data.status === "OK") {
                db.removeNewQuizzes();
                $('#madeOffline').html("");
                $('#info').html("Your quiz was successfully added.")
            }
        }).catch(function (err) {
            console.log(err);
        })
    })
}

$(document).ready(function () {
    addQuestion();
    setTimeout(fillInOfflineMadeQuizzes, 50);
    $('#addQuestion').on('click', addQuestion);
    $('#submitButton').on('click', handleSubmit);
    $('#madeOffline').on('click', '.pushOfflineMade', pushOfflineMade);
});
