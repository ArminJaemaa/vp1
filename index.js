const express = require("express");
const dtEt = require("./date_time.js");
const fs = require("fs");
const dbInfo = require("../vp1_confiq.js");
const mysql = require("mysql2");
//päringu lahti arutamiseks post päringute puhul.
const bodyparser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  //res.send("express läks täiesti käima");
  res.render("index");
});

//andmebaasi ühendus:
const conn = mysql.createConnection({
  host: dbInfo.confiqdata.host,
  user: dbInfo.confiqdata.user,
  password: dbInfo.confiqdata.passWord,
  database: dbInfo.confiqdata.dataBase,
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
        req.body.firstNameInput +
          " " +
          req.body.lastNameInput +
          " ( " +
          wkDays +
          " " +
          dateNow +
          " kell " +
          timeNow +
          " )" +
          ";",
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
      visits = data.split(";");
      res.render("visitlog", { h3: "külastus", listData: visits });
    }
  });
});
app.get("/regvisitdb", (req, res) => {
  let notice = "";
  let firstName = "";
  let lastName = "";
  res.render("regvisitdb", {
    notice: notice,
    firstName: firstName,
    lastName: lastName,
  });
});
app.post("/regvisitdb", (req, res) => {
  let notice = "";
  let firstName = "";
  let lastName = "";
  if (!req.body.firstNameInput || !req.body.lastNameInput) {
    notice = "osa andmeid sisestamata";
    lastName = req.body.lastNameInput;
    firstName = req.body.firstNameInput;
    res.render("regvisitdb", {
      notice: notice,
      firstName: firstName,
      lastName: lastName,
    });
  } else {
    let sqlreq = "INSERT INTO vp1_visitlog (first_name, last_name) VALUES(?,?)";
    conn.query(
      sqlreq,
      [req.body.firstNameInput, req.body.lastNameInput],
      (err, sqlres) => {
        if (err) {
          throw err;
        } else {
          notice = "Andmed kirjutati andmebaasi";
          console.log("andmebaasi kirjutati");
          res.render("regvisitdb", {
            notice: notice,
            firstName: firstName,
            lastName: lastName,
          });
        }
      }
    );
  }
});
app.get("/eestifilm", (req, res) => {
  res.render("film_index");
});
app.get("/eestifilm/tegelased", (req, res) => {
  let sqlReq = "SELECT first_name, last_name, birth_date FROM person";
  let persons = [];
  conn.query(sqlReq, (err, sqlres) => {
    if (err) {
      throw err;
    } else {
      console.log(sqlres);
      persons = sqlres;
      res.render("tegelased", { persons: persons });
    }
  });
  //res.render("tegelased");
});
app.listen(5133);
