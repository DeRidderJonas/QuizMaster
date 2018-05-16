"use strict";
const express = require('express');
const router = express.Router();
const fs = require("fs");
const Ajv = require("ajv");
const ajv = new Ajv();
const JSONSchemaQuiz = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "id":"jonas.de.ridder.quizSchema", //TODO change id,
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
const localPathToJSON = "./routes/quizzes.json";
const serverPathToJSON = "/app/routes/quizzes.json";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/getAnyQuizes', function (req, res) {
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
    readQuizzes()
        .then(quizzes => quizzes.filter(q=>q.title.indexOf(criteria) > -1))
        .then(quizzes => res.json(JSON.stringify(quizzes)));
});

router.post('/makeQuiz', function (req, res, next) {
    let quizJson = req.body.quiz;
    let quizObj = JSON.parse(quizJson);
    let quiz = new Quiz.Quiz(0,quizObj.title, quizObj.description, quizObj.questions, 0);
    insertQuiz(quiz, res);
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
    return new Promise(function (s, f) {
        fs.readFile(localPathToJSON, 'utf-8', function (err, data) {
            if(err){
                fs.readFile(serverPathToJSON, 'utf-8', function (err, data) {
                    if(err)f(err);
                    s(JSON.parse(data)
                        .filter(q=>validate(q))
                        .map(q=>new Quiz.Quiz(q.id,q.title,q.description,q.questions,q.avgScore,q.amountPlayed))
                    );
                })
            }else{
                //s(data)
                s(JSON.parse(data)
                    .filter(q=>validate(q))
                    .map(q=>new Quiz.Quiz(q.id, q.title, q.description, q.questions, q.avgScore, q.amountPlayed))
                )
            }

        })
    })
}

function insertQuiz(quiz, res) {
    readQuizzes().then(function (quizzesDB) {
        quiz.id = quizzesDB.length;
        if(validate(quiz)){ //ik kies ervoor om hier pas de validatie te doen in plaats van voor het lezen van de quizzes zodat de id binnen de eventuele limiet kan blijven
            quizzesDB.push(quiz);
            fs.writeFile(localPathToJSON, JSON.stringify(quizzesDB), function (err) {
                if(err){
                    fs.writeFile(serverPathToJSON, JSON.stringify(quizzesDB), function (err) {
                        if(err)console.error(err);
                        res.send(JSON.stringify({"status":"OK"}));
                    })

                } else{
                    console.log("successfully made quiz: ", quiz.title);
                    res.send(JSON.stringify({"status": "OK"}));
                }
            })
        }
    }).catch(err=>console.error(err))
}

function updateQuiz(quizID, fields, newValues) {
    readQuizzes()
        .then(function (quizzesDB) {
            for(let i=0;i<fields.length;i++){
                quizzesDB[quizID][fields[i]] = newValues[i];
            }
            fs.writeFile(localPathToJSON, JSON.stringify(quizzesDB), function (err) {
                if(err){
                    console.error(err);
                    fs.writeFile(serverPathToJSON, JSON.stringify(quizzesDB), function (err) {
                        if(err)console.error(err);
                    })
                }
            })
        })
        .catch(err=>console.error(err))
}

function getQuizById(quizID) {
    return readQuizzes().then(quizzes => quizzes.filter(q=>q.id == quizID)[0])
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
