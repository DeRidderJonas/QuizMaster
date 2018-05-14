"use strict"
const express = require('express');
const router = express.Router();
const fs = require("fs");
const Ajv = require("Ajv");
const ajv = new Ajv();
const JSONSchemaQuiz = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "id":"quizSchema", //TODO change id,
    "title":"Quiz",
    "description":"Quiz",
    "type":"object",
    "properties":{
        "id":{"type": "number"},
        "title":{"type":"string"},
        "description":{"type":"string"},
        "questions":{
            "type":"array",
            "items": [{
                "type":"object",
                "properties":{
                    "question":{"type":"string"},
                    "rightAnswer":{"type":"string"},
                    "wrongAnswer1": {"type":"string"},
                    "wrongAnswer2": {"type":"string"},
                    "wrongAnswer3": {"type":"string"},
                }
            }]
        },
        "avgScore":{"type":"number"},
        "amountPlayed":{"type":"number"}
    },
    "required":["id","title","questions"]
};
const validate = ajv.compile(JSONSchemaQuiz);
const Quiz = require('./../Shared-javascript/Quiz');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/getAnyQuizes', function (req, res) {
    console.log("get any quizes");
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
        })
        .catch(err=>console.error(err));
});

router.post('/searchForQuiz', function (req, res) {
    let criteria = req.body.searchCriteria;
    console.log("searching for quizzes with criteria: ", criteria);
    readQuizzes()
        .then(quizzes => quizzes.filter(q=>q.title.indexOf(criteria) > -1))
        .then(quizzes => res.json(JSON.stringify(quizzes)));
});

router.post('/makeQuiz', function (req, res, next) {
    let quizJson = req.body.quiz;
    let quizObj = JSON.parse(quizJson);
    let quiz = new Quiz.Quiz(0,quizObj.title, quizObj.description, quizObj.questions, 0);
    readQuizzes().then(function (quizzesDB) {
        quiz.id = quizzesDB.length;
        if(validate(quiz)){
            quizzesDB.push(quiz);
            fs.writeFile('./routes/quizzes.json', JSON.stringify(quizzesDB), function (err) {
                if(err){console.log(err)}else{
                    console.log("successfully made quiz: ", quiz.title);
                    res.send(JSON.stringify({"status": "OK"}));
                }
            })
        }
    }).catch(err=>console.error(err))
});

router.post('/getQuestionsForQuiz', function (req, res) {
    let quizID = req.body.quizID;
    getQuestionsForQuiz(quizID)
        .then(shuffleQuestions)
        .then(questions=>{
            getQuizTitle(quizID)
                .then(title=>{return {"questions":questions, "title":title}})
                .then(q=>res.json(JSON.stringify(q)))
                .catch(err=>console.error(err))
        }).catch(err=>console.error(err))
});

function shuffleQuestions(questions){
    let shuffled = [];
    questions.forEach(q=>{
        let chosenNumbers = [];
        let random = Math.floor(Math.random()*4);
        for(let i=0; i<4; i++){
            while(chosenNumbers.indexOf(
                random) >= 0){
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

router.post('/handleAnswers', function (req, res) {
    let quizID = req.body.quizID;
    let answers = JSON.parse(req.body.answers);
    let score = 0;

    getQuestionsForQuiz(quizID)
        .then(question=>question.map(q=>q.rightAnswer))
        .then(function (correctAnswers) {
            for(let i=0; i<correctAnswers.length; i++){
                if(correctAnswers[i] === answers[i])score++;
            }
            getAvgScoreAndAmountPlayedForQuiz(quizID).then(quizDetail=>{
                let newAvg = Math.round(((quizDetail.avgScore*quizDetail.amountPlayed)+score)/(quizDetail.amountPlayed+1) * 100) / 100;
                updateQuiz(quizID,["avgScore","amountPlayed"],[newAvg,(quizDetail.amountPlayed+1)]);
                res.send(JSON.stringify({"score":score, "avgScore":newAvg}))
            }).catch(err=>console.error(err));
        }).catch(err=>console.error(err));
});

function readQuizzes() {
    console.log("reading quizzes");
    return new Promise(function (s, f) {
        fs.readFile('routes\\quizzes.json', 'utf-8', function (err, data) {
            if(err)f(err);
            //s(data)
            s(JSON.parse(data).filter(q=>validate(q)))
        })
    })
}

function getQuizById(quizID) {
    return readQuizzes().then(quizzes => quizzes.filter(q=>q.id == quizID)[0])
        .catch(err=>console.error(err))
}

function updateQuiz(quizID, fields, newValues) {
    readQuizzes()
        .then(function (quizzesDB) {
            for(let i=0;i<fields.length;i++){
                quizzesDB[quizID][fields[i]] = newValues[i];
            }
            fs.writeFile('.\\routes\\quizzes.json', JSON.stringify(quizzesDB), function (err) {
                if(err)console.log("updating",err);
            })
        })
        .catch(err=>console.error(err))
}

function getQuestionsForQuiz(quizID) {
    return getQuizById(quizID)
        .then(q=>q.questions)
        .catch(err=>console.error(err))
}

function getAvgScoreAndAmountPlayedForQuiz(quizID) {
    return getQuizById(quizID).then(q=>{
        return {"avgScore":q.avgScore, "amountPlayed":q.amountPlayed}
    }).catch(err=>console.error(err))
}

function getQuizTitle(quizID){
    return getQuizById(quizID)
        .then(q=>q.title)
        .catch(err=>console.error(err))
}

module.exports = router;