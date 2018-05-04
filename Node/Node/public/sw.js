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
                'assets/js/endQuiz.js',
                'assets/js/home.js',
                'assets/js/makeQuiz.js',
                'index.html',
                'makeQuiz.html',
                'quiz.html'
            ])
        })
    )
});

self.addEventListener('fetch', function (event) {
    //console.log("SW fetch: ", event.request);
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
});

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