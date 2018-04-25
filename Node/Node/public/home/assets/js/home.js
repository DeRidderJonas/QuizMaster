
function getQuizes(){
    $.ajax({
        url : '/getAnyQuizes',
        type: "get"
    }).done(function (data) {
        $('#quizzes').html("");
        data = JSON.parse(data);
        console.log(data);
        data.forEach(quiz =>{
            console.log(quiz);
            let html = `<section class="quiz">
                      <img src="assets/images/${quiz.imgUrl}" title="QuizIcon" alt="QuizIcon">
                      <h1>${quiz.title}</h1>
                      <p>${quiz.description}</p>
                      <a href="quiz.html?quiz=${quiz.id}" class="continue"><img src="assets/images/arrow.png"></a>
                    </section>`;
            $('#quizzes').append(html);
        });

    }).catch(function (err){
        console.log(err);
    })
}

$(document).ready(function(){
    getQuizes();
});