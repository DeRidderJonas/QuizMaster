
function getQuizes(){
    $('#quizzes').html("");
    $.ajax({
        url : '/getAnyQuizes',
        type: "get"
    }).done(function (data) {
        data = JSON.parse(data);
        FillInQuizzes(data);
        if(db.dbAvailable()){
            // let addNewQuizzes = db.canAddMoreQuizzes();
            // if (addNewQuizzes){
            //     data.forEach(quiz=>{
            //         db.addQuiz(quiz);
            //     })
            // }
            db.canAddMoreQuizzes().then(function (roomAvailable) {
                if(roomAvailable){
                    data.forEach(quiz=>db.addQuiz(quiz))
                }
            })
        }
    }).catch(function (){ //offline backup
        if(db.dbAvailable()){
            db.getMultipleQuizzes().then(FillInQuizzes);
        }else{
            $('#quizzes').html('No quizzes found, try again later');
        }
    })
}

function FillInQuizzes(quizzes) {
    quizzes.forEach(quiz =>{
        let html = `<section class="quiz">
                      <img src="assets/images/${quiz.imgUrl}" title="QuizIcon" alt="QuizIcon">
                      <h1>${quiz.title}</h1>
                      <p>${quiz.description}</p>
                      <a href="quiz.html?quiz=${quiz.id}" class="continue"><img src="assets/images/arrow.png"></a>
                    </section>`;
        $('#quizzes').append(html);
    });
}

$(document).ready(function(){
    getQuizes();
});