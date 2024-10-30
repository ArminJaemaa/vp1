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
  const semestrist = dtEt.semester("9-2-2024");
  //res.send("express läks täiesti käima");
  //console.log(semestrist);
  res.render("index", { semestrist }); //, days: dtEt.daysBetween("9-2-2024") });
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
      //persons = sqlres;
      for (let i = 0; i < sqlres.length; i++) {
        persons.push({
          first_name: sqlres[i].first_name,
          last_name: sqlres[i].last_name,
          birth_date: dtEt.givenDate(sqlres[i].birth_date),
        });
      }
      res.render("tegelased", { persons: persons });
    }
  });
  //res.render("tegelased");
});
app.get("/eestifilm/movies", (req, res) => {
  let sqlreq = "SELECT title, production_year FROM movie";
  let movies = [];
  conn.query(sqlreq, (err, sqlres) => {
    if (err) {
      throw err;
    } else {
      console.log(sqlres);
      movies = sqlres;
      res.render("movies",{movies: movies});
    }
  });
});
app.get("/eestifilm/sisestus", (req, res) => {
  let alert = "";
  let movieName = "";
  let movieYear = "";
  let actorFirstName = "";
  let actorLastName = "";
  let birthDate = "";
  res.render("film_insert", {
    alert: alert,
    movieName: movieName,
    movieYear: movieYear,
    actorFirstName: actorFirstName,
    actorLastName: actorLastName,
    birthDate: birthDate,
  });
});
app.post("/eestifilm/sisestus", (req, res) => {
  let alert = "";
  let movieName = "";
  let movieYear = "";
  let actorFirstName = "";
  let actorLastName = "";
  let birthDate = "";
  if (req.body.movieSubmit) {
    if (!req.body.movieNameInput || !req.body.movieYearInput) {
      alert = "Osa andmeid sisestamata";
      movieName = req.body.movieNameInput;
      movieYear = req.body.movieYearInput;
      res.render("film_insert", {
        alert: alert,
        movieName: movieName,
        movieYear: movieYear,
        actorFirstName: actorFirstName,
        actorLastName: actorLastName,
        birthDate: birthDate,
      });
    } else {
      sqlreq = "INSERT INTO movie (title, production_year) VALUES(?,?)";
      conn.query(
        sqlreq,
        [req.body.movieNameInput, req.body.movieYearInput],
        (err, sqlRes) => {
          if (err) {
            throw err;
          } else {
            alert = "Andmed kirjutati andmebaasi";
            console.log("kirjutati andmebaasi");
            res.render("film_insert", {
              alert: alert,
              movieName: movieName,
              movieYear: movieYear,
              actorFirstName: actorFirstName,
              actorLastName: actorLastName,
              birthDate: birthDate,
            });
          }
        }
      );
    }
  } else if (req.body.actorSubmit) {
    if (
      !req.body.actorFirstNameInput ||
      !req.body.actorLastNameInput ||
      !req.body.actorBirthDateInput
    ) {
      alert = "osa andmeid sisestamata";
      actorFirstName = req.body.actorFirstNameInput;
      actorLastName = req.body.actorLastNameInput;
      birthDate = req.body.actorBirthDateInput;
      res.render("film_insert", {
        alert: alert,
        movieName: movieName,
        movieYear: movieYear,
        actorFirstName: actorFirstName,
        actorLastName: actorLastName,
        birthDate: birthDate,
      });
    } else {
      sqlreq =
        "INSERT INTO person (first_name, last_name, birth_date) VALUES(?,?,?)";
      conn.query(
        sqlreq,
        [
          req.body.actorFirstNameInput,
          req.body.actorLastNameInput,
          req.body.actorBirthDateInput,
        ],
        (err, sqlres) => {
          if (err) {
            throw err;
          } else {
            alert = "Andmed kirjutati andmebaasi";
            console.log("kirjutati andmebaasi");
            res.render("film_insert", {
              alert: alert,
              movieName: movieName,
              movieYear: movieYear,
              actorFirstName: actorFirstName,
              actorLastName: actorLastName,
              birthDate: birthDate,
            });
          }
        }
      );
    }
  }
});
app.get("/visitlogdb", (req, res) => {
  let sqlReq = "SELECT first_name, last_name, visit_time FROM vp1_visitlog";
  let visits = [];
  conn.query(sqlReq, (err, sqlRes) => {
    if (err) {
      throw err;
    } else {
      console.log(sqlRes);
      for (let i = 0; i < sqlRes.length; i++) {
        visits.push({
          first_name: sqlRes[i].first_name,
          last_name: sqlRes[i].last_name,
          visit_time: dtEt.givenDate(sqlRes[i].visit_time),
        });
      }
      //visits = sqlRes;
      res.render("visitlogdb", { visits: visits });
    }
  });
});
app.get("/add_news", (req, res) => {
  let notice = "";
  let newsText = "";
  let expireDate = dtEt.expireDate();
  res.render("add_news", {
    notice: notice,
    expireDate: expireDate,
    newsText: newsText,
  });
});
app.listen(5133);
