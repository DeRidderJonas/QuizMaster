if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {scope: '/'})
        .then(function(reg) {
            // registration worked
            console.log('Registration succeeded. Scope is ' + reg.scope);
        }).catch(function(error) {
        // registration failed
        console.log('Registration failed with ' + error);
    });
}

self.addEventListener('install', function (event) {
    console.log("SW install");
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                '/assets/css/reset.css',
                '/assets/js/jquery-3.1.1.min.js',
                '/home/assets/css/endQuiz.css',
                '/home/assets/css/home.css',
                '/home/assets/css/makeQuiz.css',
                '/home/assets/css/quiz.css',
                '/home/assets/css/shared.css',
                '/home/assets/images/arrow.png',
                '/home/assets/images/back-arrow.png',
                '/home/assets/js/endQuiz.js',
                '/home/assets/js/home.js',
                '/home/assets/js/makeQuiz.js',
                '/index.html',
                '/home/index.html',
                '/home/makeQuiz.html',
            ])
        })
    )
});

self.addEventListener('fetch', function (event) {
    console.log("SW fetch: ", event.request);
    event.respondWith(
        caches.match(event.request).then(function (reponse) {
            return reponse || fetch(event.request).then(function (response) {
                return caches.open('v1').then(function (cache) {
                    cache.put(event.request, reponse.clone());
                    return respone;
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