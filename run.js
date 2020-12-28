const config = require("./config.json");

/*
 * Import the web server stuffs
 */

const express = require("express");
const app = express();
const port = config.port;
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const qt = require("quickthumb");

/*
 * Init the web server
 */

const middleware = [
  helmet({
    frameguard: false,
  }),
  morgan("tiny"), // Logs request data to console
  qt.static(__dirname + "/public", {
    type: "resize",
  }), // low res thumbnails + static files
];

app.set("view engine", "ejs"); // ejs for server side js templating
app.use(middleware);
console.log(__dirname);

/*
 * Create the Routes
 */

app.get("/", function (req, res) {
  const cards = JSON.parse(fs.readFileSync("./cards.json"));
  const socials = JSON.parse(fs.readFileSync("./socials.json"));
  return res.render("index.ejs", {
    cards: cards,
    socials: socials,
  });
});

app.get("/character/:name", function (req, res) {
  const data = JSON.parse(fs.readFileSync("./characters.json"));
  const fursonaData = data[req.params.name];
  const socials = JSON.parse(fs.readFileSync("./socials.json"));
  if (fursonaData) {
    return res.render("character.ejs", {
      fursona: fursonaData,
      socials: socials,
      showNsfw: false,
    });
  } else {
    return res.status(404).render("error.ejs", {
      errorNum: 404,
      errorMsg: "character not found.",
      description: "as far as I can tell, this is a normal error.",
      socials: socials,
    });
  }
});

app.get("/character", function (req, res) {
  return res.redirect("/#characters");
});

app.get("/nsfw", function (req, res) {
  const galleries = [];
  const characters = JSON.parse(fs.readFileSync("./characters.json"));
  Object.keys(characters).forEach((character) => {
    const characterImages = [];
    Object.keys(characters[character].galleries).forEach((gallery) => {
      characters[character].galleries[gallery].images.forEach((image) => {
        if (image.nsfw) characterImages.push(image);
      });
    });
    if (characterImages.length > 0)
      galleries.push({
        title: characters[character].name,
        images: characterImages,
      });
  });

  const data = {
    name: "NSFW Art",
    color: "is-red is-red-gradient",
    bio: "Various characters, 18+ only!",
    icon: "/images/nsfw/icon.png?dim=420",
    galleries: galleries,
  };

  const socials = JSON.parse(fs.readFileSync("./socials.json"));
  return res.render("character.ejs", {
    fursona: data,
    socials: socials,
    showNsfw: true,
  });
});

// Error Handling

app.use(function (req, res) {
  // 404
  const socials = JSON.parse(fs.readFileSync("./socials.json"));
  return res.status(404).render("error.ejs", {
    errorNum: 404,
    errorMsg: "file not found.",
    description: "as far as I can tell, this is a normal error.",
    socials: socials,
  });
});

app.use(function (err, req, res, next) {
  // other errors
  console.log(err);
  return res.status(500).render("error.ejs", {
    errorNum: 500,
    errorMsg: "internal server error",
    description: "this really wasn't supposed to happen!",
    socials: {},
  });
});

// start listening to requests
app.listen(port);
console.log("Listening to requests on port " + port);
