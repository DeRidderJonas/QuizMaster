
function getQuizes(){
    $('#quizzes').html("");
    $.ajax({
        url : '/getAnyQuizes',
        type: "get"
    }).done(function (data) {
        data = JSON.parse(data);
        FillInQuizzes(data);
        stuckCounter = 0;
        while(!db.dbAvailable() && stuckCounter < 1000){stuckCounter++}
        if(db.dbAvailable()){
            db.canAddMoreQuizzes().then(function (roomAvailable) {
                if(roomAvailable){
                    data.forEach(quiz=>db.addQuiz(quiz))
                }
            })
        }
    }).catch(function (){ //offline backup
        if(db.dbAvailable()){
            console.log("offline backup");
            db.getMultipleQuizzes().then(FillInQuizzes);
        }else{
            $('#quizzes').html('No quizzes found, try again later');
        }
    })
}

function FillInQuizzes(quizzes) {
    quizzes.forEach(quiz =>{
        if(quiz !== null && quiz !== undefined){
            let html = `<section class="quiz">
                      <h1>${quiz.title}</h1>
                      <p>${quiz.description}</p>
                      <a href="quiz.html?quiz=${quiz.id}" class="continue"><img src="assets/images/arrow.png"></a>
                    </section>`;
            $('#quizzes').append(html);
        }
    });
}

$(document).ready(function(){
    getQuizes();
});