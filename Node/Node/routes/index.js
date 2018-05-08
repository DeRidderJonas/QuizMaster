var express = require('express');
var router = express();
let fs = require("fs");
const Ajv = require("Ajv");
let ajv = new Ajv();
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
var validate = ajv.compile(JSONSchemaQuiz);
const Quiz = require('./../Shared-javascript/Quiz');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getAnyQuizes', function (req, res) {
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
                if(validate(quizzesDB[quizIDs[i]])){
                    quizzes.push(quizzesDB[quizIDs[i]]);
                }
            }

            res.json(JSON.stringify(quizzes));
        })
        .catch(err=>console.error(err));
});

router.post('/makeQuiz', function (req, res, next) {
    console.log(req.body.quiz);
    let quizJson = req.body.quiz;
    let quizObj = JSON.parse(quizJson);
    let quiz = new Quiz.Quiz(0,quizObj.title, quizObj.description, quizObj.questions, 0);
    readQuizzes().then(function (quizzesDB) {
        quiz.id = quizzesDB.length;
        quizzesDB.push(quiz);
        fs.writeFile('./routes/quizzes.json', JSON.stringify(quizzesDB), function (err) {
            if(err)console.log(err);
        })
    }).catch(err=>console.error(err))
});

router.post('/getQuestionsForQuiz', function (req, res) {
    let quizID = req.body.quizID;
    getQuestionsForQuiz(quizID)
        .then(shuffleQuestions)
        .then(q=>res.json(JSON.stringify(q)))
        .catch(err=>console.error(err))
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
    //let userID = req.body.userID;
    let quizID = req.body.quizID;
    let answers = JSON.parse(req.body.answers);
    let score = 0;

    getQuestionsForQuiz(quizID)
        .then(question=>question.map(q=>q.rightAnswer))
        .then(function (correctAnswers) {
            for(let i=0; i<correctAnswers.length; i++){
                if(correctAnswers[i] === answers[i])score++;
            }
            console.log("score",score);
            getAvgScoreAndAmountPlayedForQuiz(quizID).then(quizDetail=>{
                console.log(quizDetail);
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
            s(JSON.parse(data))
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
            console.log("writing quiz");
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
        console.log(q);
        return {"avgScore":q.avgScore, "amountPlayed":q.amountPlayed}
    }).catch(err=>console.error(err))
}

module.exports = router;
