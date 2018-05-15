let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnAdd.style.display = 'block';
});

btnAdd.addEventListener('click', (e) => {
    btnAdd.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice
        .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
});

window.addEventListener('appinstalled', (evt) => {
    app.logEvent('a2hs', 'installed');
});