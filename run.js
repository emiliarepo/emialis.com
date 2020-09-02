const config = require('./config.json')

/*
 * Import the web server stuffs
 */

const express = require('express');
const app = express();
const port = config.port;
const helmet = require('helmet');
const morgan = require("morgan");
const fs = require("fs");
const qt = require("quickthumb")


/*
 * Init the web server
 */

const middleware = [
    helmet({
        frameguard: false
    }),
    morgan('tiny'), // Logs request data to console
    qt.static(__dirname + '/public', {
        type: "resize"
    }) // low res thumbnails + static files
]

app.set('view engine', 'ejs'); // ejs for server side js templating
app.use(middleware);
console.log(__dirname)

/*
 * Create the Routes
 */

app.get('/', function (req, res) {
    const data = JSON.parse(fs.readFileSync("./data.json"));
    return res.render('index.ejs', {
        data: data
    })
})

app.get('/character/:name', function (req, res) {
    const data = JSON.parse(fs.readFileSync("./characters.json"));
    const fursonaData = data[req.params.name];
    if (fursonaData) {
        return res.render('character.ejs', {
            fursona: fursonaData
        })
    } else {
        return res.status(404).render('error.ejs', {
            errorNum: 404,
            errorMsg: "character not found.",
            description: "as far as I can tell, this is a normal error.",
        })
    }
})

app.get('/character', function (req, res) {
    return res.redirect("/#characters")
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