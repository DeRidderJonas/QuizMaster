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
    getQuestionsForQuiz: "select * from questions where quizID = ?"
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getAnyQuizes', function (req, res) {
    connection.query(Q.getLastQuizID, function (err, result) {
        let highestID = result[0].quizID;
        let quizIDs = "";
        for (let i = 0; i < 5; i++){
            quizIDs += Math.floor(Math.random() * highestID);
            if (i < 4){
                quizIDs += ",";
            }
        }
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
    })
});

router.post('/makeQuiz', function (req, res, next) {
    console.log(req.body.quiz);
    let quizJson = req.body.quiz;
    let quiz = JSON.parse(quizJson);
    connection.query(Q.insertQuiz, [quiz.title, "", ""], function (err, result) {
        if(err){console.error(err)}
        console.log(result);
        let id = result.insertId;
        if (id > -1){
            quiz.questions.forEach(q=>{
                connection.query(Q.insertQuestion,[id,q.answer1, q.answer2, q.answer3, q.answer4, q.question], function (questionErr, questionRes) {
                    if(questionErr){console.error(questionErr)}
                })
            })
        }
    })

});

router.post('/getQuestionsForQuiz', function (req, res) {
    let quizID = req.body.quizID;
    let questions = [];
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
    });
});

router.post('/handleAnswer', function (req, res) {
    console.log(req.body);
});

module.exports = router;
