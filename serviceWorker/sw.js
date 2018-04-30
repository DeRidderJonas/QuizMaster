"use strict";

const quizCacheName = "quizCache";
var quizCacheFiles = [
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
    '/home/assets/js/playQuiz.js',
    '/home/assets/js/profile.js'
];

self.addEventListener('install', function (event) {
    console.log('From SW: Install event:', event);
    self.skipWaiting();
    event.waitUntil(
        caches.open(quizCacheName).then(function (cache) {
            return cache.addAll(quizCacheFiles);
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('From SW: Activate State', event);
    self.clients.claim();
    event.waitUntil(
        caches.keys().then(function (keyList) {
            let deletePromises = [];
            for (var i= 0; i < keyList.length; i++){
                if (keyList[i] !== quizCacheName){
                    deletePromises.push(caches.delete(keyList[i]));
                }
            }
            return Promise.all(deletePromises);
        })
    )
});

self.addEventListener('fetch', function (event) {
    let requestUrl = new URL(event.request.url);
    let requestPath = requestUrl.pathname;
    let fileName = requestPath.substring(requestPath.lastIndexOf('/') + 1);

    if(fileName == 'sw.js'){
        event.respondWith(fetch(event.request));
    }else{
        cacheFirst(event.request);
    }
});

function cacheFirst(request){
    return caches.match(request).then(function (cacheResponse) {
        return cacheResponse || fetchRequestAndCache(request);
    })
}

function fetchRequestAndCache(request){
    return fetch(request).then(function(networkResponse){
        caches.open(getCacheName(request)).then(function (cache) {
            cache.put(request,networkResponse);
        });
        return networkResponse.clone();
    })
}

function getCacheName(request) {
    let requestUrl = new URL(request.url);
    let requestPath = requestUrl.pathname;

    return quizCacheName;
}