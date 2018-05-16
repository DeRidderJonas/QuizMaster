const db = (function () {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if (!window.indexedDB) {
        console.log('no indexed db');
        return;
    } else {
        console.log('indexed db recognised');
    }

    const maxAmountQuizzesInIndexedDB = 5;
    let currentAmountOfQuizzesInIndexedDB =0;
    let currentAmountOfNewQuizzesInIndexedDB = 0;

    const quizDB = 'quizDB';
    const quizName = 'quiz';
    const makeQuiz = 'makeQuiz';
    let request = window.indexedDB.open(quizDB, 1);
    let db = null;

    request.onerror = function (e) {
        console.error("something went wrong!", e);
    };
    request.onupgradeneeded = function (e) {
        db = e.target.result;
        db.createObjectStore(quizName, {keyPath: 'id'});
        db.createObjectStore(makeQuiz, {keyPath: 'id'});
        console.log("db created");
    };
    request.onsuccess = function (e) {
        console.log('connected to db');
        db = e.target.result;
        PromiseToCount().then(count=>currentAmountOfQuizzesInIndexedDB=count);
        PromsiseToCountNewQuizzes().then(count=>currentAmountOfNewQuizzesInIndexedDB=count);
    };

    function dbAvailable() {
        return db !== null;
    }

    function promiseToGet(key) {
        console.log(key);
        return new Promise(function (s, f) {
            let trans = db.transaction([quizName], 'readwrite');
            let os = trans.objectStore(quizName);
            let request = os.get(key);
            request.onsuccess = function (e) {
                let quizInfo = e.target.result;
                s(new Quiz(quizInfo.id, quizInfo.title, quizInfo.description,
                    quizInfo.questions, quizInfo.avgScore, quizInfo.amountPlayed))
            };
            request.onerror = f;
        })
    }

    function PromiseToCount() {
        return new Promise(function (s, f) {
            let trans = db.transaction(quizName);
            let os = trans.objectStore(quizName);
            let request = os.count();
            request.onsuccess = function (e) {
                s(e.target.result);
            };
            request.onerror = f;
        })
    }

    function addQuiz(newQuiz) {
        try {
            let trans = db.transaction([quizName], 'readwrite');
            let os = trans.objectStore(quizName);
            newQuiz.id = currentAmountOfQuizzesInIndexedDB;
            os.add(newQuiz);
            currentAmountOfQuizzesInIndexedDB++
        } catch (err) {
            console.error(err);
        }
    }

    function getQuiz(id) {
        if (id >= 0 && id < maxAmountQuizzesInIndexedDB) {
            return promiseToGet(id);
        }
        return null;
    }

    function getQuestionsForQuiz(id) {
        return getQuiz(id).then(q => q.questions)
            .then(shuffleQuestions)
    }

    function shuffleQuestions(questions) {
        let shuffled = [];
        questions.forEach(q => {
            let chosenNumbers = [];
            let random = Math.floor(Math.random() * 4);
            for (let i = 0; i < 4; i++) {
                while (chosenNumbers.indexOf(random) >= 0) {
                    random = Math.floor(Math.random() * 4);
                }
                chosenNumbers.push(random);
            }
            let shuffledQuestion = {"question": q.question};
            shuffledQuestion["answer" + chosenNumbers[0]] = q.rightAnswer;
            shuffledQuestion["answer" + chosenNumbers[1]] = q.wrongAnswer1;
            shuffledQuestion["answer" + chosenNumbers[2]] = q.wrongAnswer2;
            shuffledQuestion["answer" + chosenNumbers[3]] = q.wrongAnswer3;
            shuffled.push(shuffledQuestion);
        });
        return shuffled;
    }

    function range(amount) {
        let numbers = [];
        for (let i = 0; i < amount; i++) {
            numbers.push(i);
        }
        return numbers;
    }

    function getMultipleQuizzes() {
        return PromiseToCount().then(function (count) {
            return Promise.all(range(count).map(getQuiz));
        });
    }

    function canAddMoreQuizzes() {
        return currentAmountOfQuizzesInIndexedDB < maxAmountQuizzesInIndexedDB;
    }

    function newQuiz(newQuiz) {
        try {
            console.log("adding new quiz to 'cache'", newQuiz);
            newQuiz.id = currentAmountOfNewQuizzesInIndexedDB;
            let trans = db.transaction([makeQuiz], 'readwrite');
            let os = trans.objectStore(makeQuiz);
            os.add(newQuiz);
            currentAmountOfNewQuizzesInIndexedDB++;
        } catch (err) {
            console.error(err);
        }
    }

    function PromsiseToCountNewQuizzes() {
        return new Promise(function (s, f) {
            let trans = db.transaction(makeQuiz, 'readwrite');
            let os = trans.objectStore(makeQuiz);
            let request = os.count();
            request.onsuccess = function (e) {
                s(e.target.result);
            };
            request.onerror = f;
        })
    }

    function PromiseToGetNewQuizzes() {
        return new Promise(function (s, f) {
            let trans = db.transaction([makeQuiz], 'readwrite');
            let os = trans.objectStore(makeQuiz);
            let request = os.getAll();
            request.onsuccess = function (e) {
                let quizzesInfo = e.target.result;
                let quizzes = [];
                quizzesInfo.forEach(q=>
                    quizzes.push(new Quiz(q.id, q.title, q.description,
                        q.questions, q.avgScore, q.amountPlayed)));
                s(quizzes);
            };
            request.onerror = f;
        })
    }

    function removeNewQuizzes() {
        console.log("removing all offline made quizzes");
        let trans = db.transaction([makeQuiz], 'readwrite');
        let os = trans.objectStore(makeQuiz);
        let request = os.clear();
        request.onsuccess = function (e) {
            console.log("newQuizzes cleared");
        }
    }

    function PromiseToGetQuizTitle(quizID) {
        return promiseToGet(quizID)
            .then(q => q.title)
    }

    return {
        addQuiz, canAddMoreQuizzes, getMultipleQuizzes, getQuestionsForQuiz,
        dbAvailable, newQuiz, getNewQuizzes: PromiseToGetNewQuizzes,
        getQuizTitle: PromiseToGetQuizTitle, removeNewQuizzes
    };
})();