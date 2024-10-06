const express = require("express");
const dtEt = require("./date_time.js");
const fs = require("fs");
//päringu lahti arutamiseks post päringute puhuö.
const bodyparser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  //res.send("express läks täiesti käima");
  res.render("index");
});

app.get("/timenow", (req, res) => {
  const weekDays = dtEt.dayEt();
  const dateNow = dtEt.dateEt();
  const timeNow = dtEt.timeEt();
  res.render("timenow", { nowWD: weekDays, nowD: dateNow, nowT: timeNow });
});

app.get("/justlist", (req, res) => {
  let folkWisdom = [];
  fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data) => {
    if (err) {
      throw err;
    } else {
      folkWisdom = data.split(";");
      res.render("justlist", { h2: "vanasõnad", listData: folkWisdom });
    }
  });
});
app.get("/reqvisit", (req, res) => {
  res.render("regvisit");
});
app.post("/reqvisit", (req, res) => {
  const wkDays = dtEt.dayEt();
  const dateNow = dtEt.dateEt();
  const timeNow = dtEt.timeEt();
  console.log(req.body);
  fs.open("public/textfiles/visitlog.txt", "a", (err, file) => {
    if (err) {
      throw err;
    } else {
      fs.appendFile(
        "public/textfiles/visitlog.txt",
        req.body.firstNameInput + " " + req.body.lastNameInput + " ( " + wkDays + " " + dateNow + " kell " + timeNow + " )" +  ";",
        (err) => {
          if (err) {
            throw err;
          } else {
            console.log("faili kirjutati");
            res.render("regvisit");
          }
        }
      );
    }
  });
});
app.get("/visitlog", (req, res) => {
  let visits = [];
  fs.readFile("public/textfiles/visitlog.txt", "utf8", (err, data) => {
    if (err) {
      throw err;
    } else {
      visits = data.split(";")
      res.render("visitlog", {h3: "külastus", listData: visits})
    }
  });
});
app.listen(5133);
