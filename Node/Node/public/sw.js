self.addEventListener('install', function (event) {
    console.log("SW install");
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                'assets/css/reset.css',
                'assets/js/jquery-3.1.1.min.js',
                'assets/css/endQuiz.css',
                'assets/css/home.css',
                'assets/css/makeQuiz.css',
                'assets/css/quiz.css',
                'assets/css/shared.css',
                'assets/images/arrow.png',
                'assets/images/back-arrow.png',
                'assets/images/favIcon.png',
                'assets/js/endQuiz.js',
                'assets/js/home.js',
                'assets/js/makeQuiz.js',
                'assets/js/indexDB.js',
                'assets/js/stats.js',
                'assets/js/Quiz.js',
                'index.html',
                'makeQuiz.html',
                'quiz.html',
                'stats.html'
            ])
        })
    )
});

self.addEventListener('fetch', function (event) { //works offline but doesn't update files
    //console.log("SW fetch: ", event.request);
    if(!(event.request.url.indexOf('getAnyQuiz') > -1) && !(event.request.url.indexOf('getQuestionsForQuiz') > -1)){
        event.respondWith(
            caches.match(event.request).then(function (res) {
                return res || fetch(event.request).then(function (response) {
                    return caches.open('v1').then(function (cache) {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                })
            })
        )
    }
});

/*self.addEventListener('fetch', function (event) { //gives updated files but doesn't work offline
    if(!(event.request.url.indexOf('getAnyQuiz') > -1) && !(event.request.url.indexOf('getQuestionsForQuiz') > -1)){
        event.respondWith(
            caches.open('v1').then(function (cache) {
                return fetch(event.request).then(function (response) {
                    cache.put(event.request, response);
                    return response;
                })
            })
        )
    }
});*/

self.addEventListener('activate', function (event) {
    console.log("SW activate");
    let cacheWhitelist = ['v1'];
    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if(cacheWhitelist.indexOf(key) === -1){
                    return caches.delete(key);
                }
            }))
        })
    )
});