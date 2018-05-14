const db = (function () {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if (!window.indexedDB) {
        console.log('no indexed db');
        return;
    } else {
        console.log('indexed db recognised');
    }

    const maxAmountQuizzesInIndexedDB = 5;

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
    };

    function dbAvailable() {
        return db !== null;
    }

    function promiseToGet(key) {
        return new Promise(function (s, f) {
            let trans = db.transaction([quizName], 'readwrite');
            let os = trans.objectStore(quizName);
            let request = os.get(key);
            request.onsuccess = function (e) {
                s(e.target.result);
            };
            request.onerror = f;
        })
    }

    function promiseToCount() {
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
            os.add(newQuiz);
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
        for (let i = 0; i < amount + 1; i++) {
            numbers.push(i);
        }
        return numbers;
    }

    function getMultipleQuizzes() {
        return Promise.all(range(maxAmountQuizzesInIndexedDB).map(getQuiz));
    }

    function canAddMoreQuizzes() {
        return promiseToCount().then(function (amount) {
            return amount < maxAmountQuizzesInIndexedDB;
        });
    }

    function newQuiz(newQuiz) {
        try {
            console.log("adding new quiz to 'cache'", newQuiz);
            PromsiseToCountNewQuizzes().then(amount => {
                newQuiz.id = amount;
                let trans = db.transaction([makeQuiz], 'readwrite');
                let os = trans.objectStore(makeQuiz);
                os.add(newQuiz);
            })
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
            console.log(os);
            let request = os.getAll();
            request.onsuccess = function (e) {
                s(e.target.result);
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