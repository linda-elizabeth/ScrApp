// to use express
const express = require("express");
const app = new express();
app.use(
  express.urlencoded({
    extended: true,
  })
);

// set port to 5000 or whichever is available
const port = process.env.PORT || 5000;

// for scraping
const axios = require("axios");
const cheerio = require("cheerio");

const textVersion = require("textversionjs");

// to use database
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const searchdata = require("./src/models/SearchData");

// setting template engine as ejs
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(express.static(__dirname + "/public"));

// route to home page
app.get("/", function (req, res) {
  res.render("index");
});

// route to collect insights
app.post("/add", async function (req, res) {
  // load data from url
  const { data } = await axios.get(req.body.domainname);
  const $ = cheerio.load(data);
  var plainText = textVersion($.html());

  // counting words
  var wdcnt = 0;
  var wd = "";
  for (let i = 0; i < plainText.length; i++) {
    if (plainText[i] == "[" || plainText == "]") {
      continue;
    }
    if (plainText[i] == "(") {
      i = plainText.indexOf(")", i) + 1;
    }
    if (plainText[i] == "<") {
      i = plainText.indexOf(">", i) + 1;
    }
    if (plainText[i] == " ") {
      if (wd == " " || wd == "") {
        continue;
      }
      if (
        wd == "!" ||
        wd == "@" ||
        wd == "#" ||
        wd == "$" ||
        wd == "%" ||
        wd == "^" ||
        wd == "&" ||
        wd == "*" ||
        wd == "_" ||
        wd == "+" ||
        wd == "-" ||
        wd == "=" ||
        wd == ";" ||
        wd == ":" ||
        wd == "|" ||
        wd == "," ||
        wd == "." ||
        wd == "/" ||
        wd == "?" ||
        wd == "~" ||
        wd == "©"
      ) {
        continue;
      }
      console.log("word=", wd);
      wdcnt += 1;
      wd = "";
    } else {
      wd += plainText[i];
    }
  }
  console.log("Word count=", wdcnt);

  // collecting web links
  var links = [];
  $("body")
    .find("a")
    .each(function (index, element) {
      links.push($(element).attr("href"));
    });

  // saving insights to database
  var searchItem = {
    domainName: req.body.domainname,
    wordCount: wdcnt,
    favourite: false,
    webLinks: links,
  };
  var item = searchdata(searchItem);
  item.save();
  res.redirect("results");
});

// route to add or remove from favourites
app.get("/update/:id", function (req, res) {
  const id = req.params.id;
  searchdata
    .findOne({ _id: id })
    .then(function (item) {
      if (item.favourite == true) {
        searchdata
          .updateOne({ _id: id }, { favourite: false }, { new: true })
          .then((item) => {
            res.redirect("/results");
          });
      } else {
        searchdata
          .updateOne({ _id: id }, { favourite: true }, { new: true })
          .then((item) => {
            res.redirect("/results");
          });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

// route to remove from search history
app.get("/delete/:id", function (req, res) {
  const id = req.params.id;
  searchdata
    .deleteOne({ _id: id })
    .then(function () {
      res.redirect("/results");
    })
    .catch((err) => {
      console.log(err);
    });
});

// route to resuts page
app.get("/results", function (req, res) {
  searchdata
    .find()
    .then(function (items) {
      res.render("results", { items: items });
    })
    .catch(function (error) {
      res.render("error");
    });
});

// listening to port
app.listen(port, () => {
  console.log("Server ready at " + port);
});
