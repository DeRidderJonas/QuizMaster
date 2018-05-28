let deferredPrompt;

let $btnAdd;

document.addEventListener("DOMContentLoaded", function () {
    $btnAdd = document.getElementById("btnAdd");

    /*if (window.matchMedia('(display-mode: browser)').matches) {
        $btnAdd.style.display = 'none';
    }*/
});

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log("beforeinstallprompt", e);
    deferredPrompt = e;
    $btnAdd.style.display = 'block';
});

btnAdd.addEventListener('click', (e) => {
    $btnAdd.style.display = 'none';
    if(deferredPrompt !== undefined){
      deferredPrompt.prompt();
      deferredPrompt.userChoice
          .then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the A2HS prompt');
              } else {
                  console.log('User dismissed the A2HS prompt');
              }
              deferredPrompt = null;
          }).catch();
    }
});

window.addEventListener('appinstalled', (evt) => {
    app.logEvent('a2hs', 'installed');
});
