const mysql = require("mysql2");
const dbInfo = require("../../vp1_confiq.js");
const conn = mysql.createConnection({
  host: dbInfo.confiqdata.host,
  user: dbInfo.confiqdata.user,
  password: dbInfo.confiqdata.passWord,
  database: dbInfo.confiqdata.dataBase,
});
const async = require("async");
const dtEt = require("../date_time.js");

//@desc home page for eestifilm section
//@route GET /eestifilm
//@access private

const eestifilm = (req, res) => {
  res.render("film_index");
};

//@desc page for eestifilm tegelased
//@route GET /eestifilm/tegelased
//@access private

const tegelased = (req, res) => {
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
};

//@desc page for eestifilm lisaSeos
//@route GET /eestifilm/lisaseos
//@access private

const lisaSeos = (req, res) => {
  //võtan kasutusele async mooduli, et korraga teha mitu andmebaasi päringut
  const filmQueries = [
    function (callback) {
      let sqlReq1 = "SELECT id, first_name, last_name, birth_date FROM person";
      conn.execute(sqlReq1, (err, result) => {
        if (err) {
          return callback(err);
        } else {
          return callback(null, result);
        }
      });
    },
    function (callback) {
      let sqlReq2 = "SELECT id, title, production_year FROM movie";
      conn.execute(sqlReq2, (err, result) => {
        if (err) {
          return callback(err);
        } else {
          return callback(null, result);
        }
      });
    },
    function (callback) {
      let sqlReq3 = "SELECT id, position_name FROM position";
      conn.execute(sqlReq3, (err, result) => {
        if (err) {
          return callback(err);
        } else {
          return callback(null, result);
        }
      });
    },
  ];
  //paneme need päringud, ehk funktsioonid paralleelselt käima, tulemuseks saame kolme päringu koondi..
  async.parallel(filmQueries, (err, results) => {
    if (err) {
      throw err;
    } else {
      console.log(results);
      res.render("add_relations", {
        personList: results[0],
        filmList: results[1],
        positionList: results[2],
      });
    }
  });
  //res.render("add_relations");
};

//@desc page for lisaSeos insert
//@route POST /eestifilm/lisaSeos
//@access private

/* const insertLisaSeos = (req, res) => {
    let alert = "";
    sqlReq = "INSERT INTO "
    conn.execute = 
}; */

//@desc page for eestifilm movies
//@route GET /eestifilm/movies
//@access private

const movies = (req, res) => {
  let sqlreq = "SELECT title, production_year FROM movie";
  let movies = [];
  conn.query(sqlreq, (err, sqlres) => {
    if (err) {
      throw err;
    } else {
      console.log(sqlres);
      movies = sqlres;
      res.render("movies", { movies: movies });
    }
  });
};

//@desc page for eestifilm sisestus
//@route GET /eestifilm/sisestus
//@access private

const sisestus = (req, res) => {
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
};

//@desc page for eestifilm insert
//@route POST /eestifilm/sisestus
//@access private

const insert = (req, res) => {
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
};

module.exports = { eestifilm, tegelased, lisaSeos, movies, sisestus, insert };
