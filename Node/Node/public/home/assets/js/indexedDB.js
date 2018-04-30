const db = (function () {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if(!window.indexedDB){
        console.log('no indexed db');
        return;
    }else{
        console.log('indexed db recognised');
    }

    const maxAmountQuizzesInIndexedDB = 3;

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

    function addQuiz(newQuiz){
        try {
            let trans = db.transaction([quizName], 'readwrite');
            let os = trans.objectStore(quizName);
            os.add(newQuiz);
        }catch (err){
            console.error(err);
        }
    }

    let quiz;
    function getQuiz(id){
        if (id > 0 && id < maxAmountQuizzesInIndexedDB){
            let trans = db.transaction(quizName);
            let os = trans.objectStore(quizName);
            os.get(id).onsuccess = function (e) {
                quiz = e.target.result;
            };
            return quiz;
        }
    }

    let quizzes = [];
    function getMultipleQuizzes(){
        quizzes = [];
        for (let i=0; i < maxAmountQuizzesInIndexedDB; i++){
            quizzes.push(getQuiz(i));
        }
        return quizzes;
    }

    let amount = 0;
    function getAmountOfQuizzes(){
        let trans = db.transaction(quizName);
        let os = trans.objectStore(quizName);

        os.count().onsuccess = function (e) {
            amount = e.target.result;
        };
        return amount;
    }

    function canAddMoreQuizzes() {
        return getAmountOfQuizzes() < maxAmountQuizzesInIndexedDB;
    }
    return {addQuiz: addQuiz, getQuiz: getQuiz, getAmountOfQuizzes: getAmountOfQuizzes,
        canAddMoreQuizzes: canAddMoreQuizzes, getMultipleQuizzes:getMultipleQuizzes,
        dbAvailable:dbAvailable};
})();