Github repo: https://github.com/DeRidderJonas/QuizMaster

SO i wanted to make an app where people could go and play Quizzes about any given subject, make it easy to play and give the users the ability to make their own Quizzes. I didn't feel like there was a need for a login system because there's no data that should be connected to an account. You might argue that the quizzes are made by a certain person but i don't think a login is needed just to make quizzes linked to an account. There is however a statistics page where you can see what you've done in the current session. You can either look on the popular page for a random Quiz, or you can search for a certain Quiz. When in offline mode, you can still play Quizzes you have backed up for offline use (you won't be able to verify your answers tough since it's server side validation) and you can still make Quizzes which you can push to the server whenever you connect to the internet again.
The app was build in Node.js and uses: Express, Ajv(for JSONSchema), serviceWorkers, cache API, sessionStorage, IndexedDB, Jquery and Promises. The front end files are stored by default in Express in the 'public' folder, the back-end files are of course in the default 'routes' folder.

The app is hosted on Heroku and can be reached by the url: https://de-ridder-jonas-quizmaster.herokuapp.com/index.html?mode=popular
Do mind that the herokuapp needs a few seconds to boot when it hasn't been used in 30 minutes so the first request will take a while to load.

There are no Security Headers installed due the npm package 'h5bp' being out of date.
This has been notified to Koen Cornelis.

I didn't feel like there was any need for Webpack since Express already compacts the js files and i have no need for modules in the browser.

Additional info: i used a JSON file as a 'database' for the Quizzes becuase that's the only data that should be saved, there's no login so no accounts that are to be protected. When you look at the code you will see 2 paths when using the JSON 'db'. I'm using these 2 paths because 1 works when using the node server local and the other works on the heroku server.

During the screencast, i was talking and explaining the app so if you were to listen to it while muted there will be some pauses between the screens
