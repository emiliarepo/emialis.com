const config = require('./config.json')
const categories = require('./data.json')

/*
 * Import the web server stuffs
 */

const express = require('express');
const app = express();
const port = config.port;
const helmet = require('helmet');
const morgan = require("morgan");


/*
 * Init the web server
 */

const middleware = [
    helmet({
        frameguard: false
    }),
    morgan('tiny'), // Logs request data to console
    express.static('public'), // public dir can be accessed
]

app.set('view engine', 'ejs'); // ejs for server side js templating
app.use(middleware);

/*
 * Create the Routes
 */

app.get('/', function (req, res) {
    return res.render('index.ejs', {
        cards: categories
    })
})

// Error Handling

app.use(function (req, res) { // 404
    return res.status(404).render('error.ejs', {
        errorNum: 404,
        errorMsg: "file not found.",
        description: "as far as I can tell, this is a normal error.",
    })
});

app.use(function (err, req, res, next) { // other errors
    console.log(err)
    return res.status(500).render('error.ejs', {
        errorNum: 500,
        errorMsg: "internal server error",
        description: "this really wasn't supposed to happen!",
    });
});


// start listening to requests
app.listen(port);
console.log('Listening to requests on port ' + port);