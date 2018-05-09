function getQuizes() {
    $('#quizzes').html("");
    $.ajax({
        url: '/getAnyQuizes',
        type: "post"
    }).done(function (data) {
        data = JSON.parse(data);
        FillInQuizzes(data);
        stuckCounter = 0;
        while (!db.dbAvailable() && stuckCounter < 1000) {
            stuckCounter++
        }
        if (db.dbAvailable()) {
            db.canAddMoreQuizzes().then(function (roomAvailable) {
                if (roomAvailable) {
                    data.forEach(quiz => db.addQuiz(quiz))
                }
            })
        }
    }).catch(function () { //offline backup
        if (db.dbAvailable()) {
            console.log("offline backup");
            db.getMultipleQuizzes().then(FillInQuizzes);
        } else {
            $('#quizzes').html('No quizzes found, try again later');
        }
    })
}

function FillInQuizzes(quizzes) {
    quizzes.forEach(quiz => {
        if (quiz !== null && quiz !== undefined) {
            let html = `<section class="quiz">
                      <h1>${quiz.title}</h1>
                      <p>${quiz.description}</p>
                      <a href="quiz.html?quiz=${quiz.id}" class="continue"><img src="assets/images/arrow.png"></a>
                    </section>`;
            $('#quizzes').append(html);
        }
    });
}

function searchForQuizzes() {
    let searchCriteria = document.getElementById("search").value;
    $.ajax({
        url: '/searchForQuiz',
        type: "post",
        data: {"searchCriteria": searchCriteria}
    }).done(function (data) {
        $('#quizzes').html("");
        FillInQuizzes(JSON.parse(data))
    }).catch(function (err) {
        $('#quizzes').prepend("You cannot search for quizzes when offline");
    })
}

$(document).ready(function () {
    if (getParameterByName("mode") === "search") {
        $('#searchbar').removeClass("hidden");
        $('#searchButton').on('click', searchForQuizzes);
    }
    getQuizes();
});