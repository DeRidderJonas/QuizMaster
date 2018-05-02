const db = (function () {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if(!window.indexedDB){
        console.log('no indexed db');
        return;
    }else{
        console.log('indexed db recognised');
    }

    const maxAmountQuizzesInIndexedDB = 5;

    const quizDB = 'quizDB';
    const quizName = 'quiz';
    let request = window.indexedDB.open(quizDB,1);
    let db = null;

    request.onerror = function (e) {
        console.error("something went wrong!",e);
    };
    request.onupgradeneeded = function (e) {
        db = e.target.result;
        let os = db.createObjectStore(quizName, {keyPath: 'id'});
        console.log("db created");
    };
    request.onsuccess = function (e) {
        console.log('connected to db');
        db = e.target.result;
    };

    function dbAvailable() {
        return db !== null;
    }

    function promiseToGet(key){
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

    function addQuiz(newQuiz){
        try {
            let trans = db.transaction([quizName], 'readwrite');
            let os = trans.objectStore(quizName);
            os.add(newQuiz);
        }catch (err){
            console.error(err);
        }
    }

    function getQuiz(id){
        if (id > 0 && id < maxAmountQuizzesInIndexedDB){
            return promiseToGet(id);
        }
        return null;
    }

    function range(amount){
        let numbers = [];
        for(let i = 1; i < amount+1; i++){
            numbers.push(i);
        }
        return numbers;
    }

    function getMultipleQuizzes(){
        return Promise.all(range(maxAmountQuizzesInIndexedDB).map(getQuiz));
    }

    function canAddMoreQuizzes() {
        return promiseToCount().then(function (amount) {
            return amount < maxAmountQuizzesInIndexedDB;
        });
    }
    return {addQuiz: addQuiz, getQuiz: getQuiz, getAmountOfQuizzes: promiseToCount,
        canAddMoreQuizzes: canAddMoreQuizzes, getMultipleQuizzes:getMultipleQuizzes,
        dbAvailable:dbAvailable};
})();