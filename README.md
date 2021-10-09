# Quiz Master
This is an app where people can go and play Quizzes about any given subject. The app makes it easy to play make your own Quizzes. When this project was made, there was no need for a login system because there's no data that should be connected to an account. You might argue that the quizzes are made by a certain person but a login just to make quizzes linked to an account is a lot of effort for very little. There is however a statistics page where you can see what you've done in the current session. You can either look on the popular page for a random Quiz, or you can search for a certain one. 

When in offline mode, you can still play Quizzes you have backed up for offline use (you won't be able to verify your answers tough since it's server side validation) and you can still make Quizzes which you can push to the server whenever you connect to the internet again.

## The app
The app was build in Node.js and uses: Express, Ajv(for JSONSchema), serviceWorkers, cache API, sessionStorage, IndexedDB, Jquery and Promises. The front end files are stored by default in Express in the 'public' folder, the back-end files are of course in the default 'routes' folder.

The app is hosted on Heroku and can be reached by the url: https://de-ridder-jonas-quizmaster.herokuapp.com/index.html?mode=popular
Do mind that the herokuapp needs a few seconds to boot in case the website hasn't been used in the last 30 minutes so the first request will take a while to load.

The quizzes are stored in a JSON file because that's the only data that should be saved, there's no login so no accounts that are to be protected. When you look at the code you will see 2 paths when using the JSON 'db'. These 2 paths exist because 1 works when using the node server locally and the other works on the heroku server.
