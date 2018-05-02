var express = require('express');
var router = express.Router();
let fs = require("fs");
const Quiz = require('./../Shared-javascript/Quiz');
const mysql = require("mysql");
const connection = mysql.createConnection({
    host: 'localhost',
    post: 3306,
    database: 'quizmaster',
    user: 'root',
    password: ''
});
const Q = {
    insertQuiz: "insert into quiz(name,author,tags) values(?,?,?)",
    insertQuestion: "insert into questions(quizID,rightAnswer, wrongAnswer1, wrongAnswer2,wrongAnswer3, question) values(?,?,?,?,?,?)",
    getLastQuizID: "select * from quiz order by quizID desc limit 1",
    getAnyQuizesUsingIds: "select * from quiz where quizID in (?)",
    getQuestionsForQuiz: "select * from questions where quizID = ?",
    setUserScore: "insert into userScores (userID, quizID, score) values(?,?,?)",
    getUserSCoreForQuiz: "select * from userScores where userID = ? and quizID = ?",
    updateUserScore: "update userSCores set score = ? where userID = ? and quizID = ?",
    getUserScores: "select q.name as quizName, us.score as score from userscores us join quiz q on us.quizID = q.quizID where userID = ?",
    getQuizzesCreatedByUser: "select name as quizName, avgScore, description, tags from quiz where authorID = ?"
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getAnyQuizes', function (req, res) {
    readQuizzes()
        .then(function (quizzesDB) {
            let quizIDs = [];
            let amountOfQuizzes = 5;
            for (let i = 0; i < amountOfQuizzes; i++){
                quizIDs.push(Math.floor(Math.random() * (quizzesDB.length)));
            }
            let quizzes = [];
            for (let i=0; i < amountOfQuizzes; i++){
                quizzes.push(quizzesDB[quizIDs[i]]);
            }
            res.json(JSON.stringify(quizzes));
        });
    /*connection.query(Q.getLastQuizID, function (err, result) {
        let highestID = result[0].quizID;
        let quizIDs = [];
        for (let i = 0; i < 5; i++){
            quizIDs.push(Math.floor(Math.random() * (highestID+1)));
        }
        quizIDs = quizIDs.join(',');
        console.log(quizIDs);
        let query = `select * from quiz where quizID in (${quizIDs})`; //insecure AF
        connection.query(query, function (error, rows) {
            let quizes = [];
            rows.forEach(row=>{
                let quiz = new Quiz.Quiz(row.quizID, row.name, row.description);
                quizes.push(quiz);
            });
            res.json(JSON.stringify(quizes))
        })
    })*/
});

router.post('/makeQuiz', function (req, res, next) {
    console.log(req.body.quiz);
    let quizJson = req.body.quiz;
    let quiz = JSON.parse(quizJson);
    readQuizzes().then(function (quizzesDB) {
        quiz.id = quizzesDB.length;
        quizzesDB.push(quiz);
        fs.writeFile('../routes/quizzes.json', JSON.stringify(quizzesDB), function (err) {
            if(err)console.log(err);
        })
    })
    /*connection.query(Q.insertQuiz, [quiz.title, "", ""], function (err, result) {
        if(err){console.error(err)}
        let id = result.insertId;
        if (id > -1){
            quiz.questions.forEach(q=>{
                connection.query(Q.insertQuestion,[id,q.answer1, q.answer2, q.answer3, q.answer4, q.question], function (questionErr, questionRes) {
                    if(questionErr){console.error(questionErr)}
                })
            })
        }
    })*/

});

router.post('/getQuestionsForQuiz', function (req, res) {
    let quizID = req.body.quizID;
    /*let questions = [];
    connection.query(Q.getQuestionsForQuiz, [quizID], function (questionError, questionRows) {
        questionRows.forEach(q=>{
            let answers = [q.rightAnswer, q.wrongAnswer1, q.wrongAnswer2,q.wrongAnswer3];
            for(let i = 0; i < 10; i++){ //switching the answers
                let index = Math.floor(Math.random() * 4);
                let index2 = Math.floor(Math.random() * 4);
                let help = answers[index];
                answers[index] = answers[index2];
                answers[index2] = help;
            }
            questions.push(new Quiz.Question(q.question, answers[0], answers[1], answers[2], answers[3]));
        });
        res.json(JSON.stringify(questions));
    });*/
    getQuestionsForQuiz(quizID)
        .then(shuffleQuestions)
        .then(q=>res.json(JSON.stringify(q)))
});

function shuffleQuestions(questions){
    let shuffled = [];
    questions.forEach(q=>{
        let chosenNumbers = [];
        let random = Math.floor(Math.random()*4);
        for(let i=0; i<4; i++){
            while(chosenNumbers.indexOf(random) >= 0){
                random = Math.floor(Math.random()*4);
            }
            chosenNumbers.push(random);
        }
        let shuffledQuestion = {"question": q.question};
        shuffledQuestion["answer"+chosenNumbers[0]] = q.rightAnswer;
        shuffledQuestion["answer"+chosenNumbers[1]] = q.wrongAnswer1;
        shuffledQuestion["answer"+chosenNumbers[2]] = q.wrongAnswer2;
        shuffledQuestion["answer"+chosenNumbers[3]] = q.wrongAnswer3;
        shuffled.push(shuffledQuestion);
    });
    return shuffled;
}

/*function updateUserScore(userID, quizID, score) {
    connection.query(Q.getUserSCoreForQuiz, [userID, quizID], function (err, res) {
        console.log("got the score");
        if(err)console.error(err);
        if (res.length !== 0){
            if (score > res[0].score){
                connection.query(Q.updateUserScore,[score, userID, quizID],function (err, res) {
                    console.log("updated score");
                    if(err)console.error(err)
                })
            }
        }else{
            connection.query(Q.setUserScore, [userID, quizID, score], function (err, res) {
                console.log("set score");
                if(err)console.error(err);
            })
        }
    })
}*/

router.post('/handleAnswers', function (req, res) {
    //let userID = req.body.userID;
    let quizID = req.body.quizID;
    let answers = JSON.parse(req.body.answers);
    let score = 0;
    //let rightAnswers = [];
    // connection.query(Q.getQuestionsForQuiz, [quizID], function (questionError, questionRows) {
    //     questionRows.forEach(q => {
    //         rightAnswers.push(q.rightAnswer);
    //     });
    //     for (let i =0; i < rightAnswers.length; i++){
    //         if (rightAnswers[i] === answers[i]) score++;
    //     }
    //     updateUserScore(userID, quizID, score);
    // });
    getQuestionsForQuiz(quizID)
        .then(question=>question.map(q=>q.rightAnswer))
        .then(function (correctAnswers) {
            for(let i=0; i<correctAnswers.length; i++){
                if(correctAnswers[i] === answers[i])score++;
            }
            console.log("score",score);
            res.redirect("/home/quizEnd.html");
        });

});

router.post('/getUserScores', function (req, res) {
     let userID = req.body.userID;
     console.log(userID);
     connection.query(Q.getUserScores, [userID], function (err, rows) {
         if (err)console.error(err);
         let completedQuizes = [];
         rows.forEach(row=>{
             completedQuizes.push({name: row.quizName, score: row.score})
         });
         connection.query(Q.getQuizzesCreatedByUser, [userID], function (err, rows) {
             if(err)console.error(err);
             console.log(rows);
             let quizzesMade = [];
             rows.forEach(row=>quizzesMade.push({name: row.quizName, avgScore: row.avgScore, description: row.description, tags: row.tags}));
             res.json(JSON.stringify({completedQuizes: completedQuizes, quizzesMade: quizzesMade}));
         })
     })
});

function readQuizzes() {
    return new Promise(function (s, f) {
        fs.readFile('../routes/quizzes.json', 'utf-8', function (err, data) {
            if(err)f(err);
            s(JSON.parse(data))
        })
    })
}

function getQuestionsForQuiz(quizID) {
    console.log("getting questions for quizID", quizID);
    return readQuizzes()
        .then(quizzes => quizzes.filter(q=>q.id == quizID))
        //.then(d=>console.log(d))
        .then(quiz=>quiz.map(q=>q.questions))
        .then(d=>d[0])
}

module.exports = router;
