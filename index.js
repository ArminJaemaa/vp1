const express = require("express");
const dtEt = require("./date_time.js");
const fs = require("fs");
const dbInfo = require("../vp1_confiq.js");
const mysql = require("mysql2");
//päringu lahti arutamiseks post päringute puhul.
const bodyparser = require("body-parser");
//failide üleslaadimiseks!!!-
const multer = require("multer");
//pildi manipuleerimiseks (suuruse muutmiseks)
const sharp = require("sharp");
//parooli krüpteerimiseks ->
const bcrypt = require("bcrypt");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //siit saab server kätte sealt kataloogist asju!!
//app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  const semestrist = dtEt.semester("9-2-2024");
  res.render("index", { semestrist });
});
//seadistame vahevara fotode laadimiseks kindlasse kataloogi!!-
const upLoadGallery = multer({ dest: "./public/Gallery/Orig/" });

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
      res.render("movies", { movies: movies });
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
  let newsTitle = "";
  let expireDate = dtEt.expireDate();
  res.render("add_news", {
    notice: notice,
    expireDate: expireDate,
    newsText: newsText,
    newsTitle: newsTitle,
  });
});
app.post("/add_news", (req, res) => {
  let notice = "";
  let newsText = "";
  let newsTitle = "";
  let expireDate = dtEt.expireDate();
  let user = 1;
  if (!req.body.titleInput || req.body.titleInput.length < 3) {
    let notice = "Uudise pealkiri peab olema vähemalt 3 tähemärki";
    let newsText = req.body.newsInput;
    let newsTitle = req.body.titleInput;
    let expireDate = req.body.expireInput;
    res.render("add_news", {
      newsText: newsText,
      newsTitle: newsTitle,
      expireDate: expireDate,
      notice: notice,
    });
  } else if (!req.body.newsInput || req.body.newsInput.length < 10) {
    let notice = "Uudise pikkus peab olema vähemalt 10 tähemärki";
    let newsText = req.body.newsInput;
    let newsTitle = req.body.titleInput;
    let expireDate = req.body.expireInput;
    res.render("add_news", {
      newsText: newsText,
      notice: notice,
      newsTitle: newsTitle,
      expireDate: expireDate,
    });
  } else {
    let newsText = req.body.newsInput;
    let newsTitle = req.body.titleInput;
    let expireDate = req.body.expireInput;
    let sqlreq =
      "INSERT INTO News (news_title, news_text, expire_date, user_id) VALUES (?,?,?,?) ";
    conn.query(
      sqlreq,
      [newsTitle, newsText, expireDate, user],
      (err, sqlres) => {
        if (err) {
          throw err;
        } else {
          let notice = "Uudis salvestati andmebaasi";
          res.render("add_news", {
            notice,
            newsText: "",
            newsTitle: "",
            expireDate: dtEt.expireDate(),
          });
        }
      }
    );
  }
});
app.get("/news", (req, res) => {
  let sqlreq =
    "SELECT news_title, news_text, news_date, expire_date FROM News ORDER BY id DESC";
  let news = [];
  conn.query(sqlreq, (err, sqlres) => {
    if (err) {
      throw err;
    } else {
      for (let i = 0; i < sqlres.length; i++) {
        news.push({
          news_title: sqlres[i].news_title,
          news_text: sqlres[i].news_text,
          news_date: dtEt.givenDate(sqlres[i].news_date),
          expire_date: dtEt.givenDate(sqlres[i].expire_date),
        });
      }
      res.render("news", { news: news });
    }
  });
  //res.render("news");
});
app.get("/photoUpload", (req, res) => {
  notice = "";
  altTxt = "";
  res.render("photo_Upload", { notice, altTxt });
});
//salvestame pildid kausta!!
//vahevara - vahetegevus enne main tegevusi!!
app.post("/photoUpload", upLoadGallery.single("photoInput"), (req, res) => {
  if (!req.file) {
    notice = "Osa andmeid sisestamata";
    altTxt = req.body.altInput;
    res.render("photo_Upload", { notice, altTxt });
  } else {
    console.log(req.body);
    console.log(req.file);
    const fileName = "vp_" + Date.now() + ".jpg";
    //nimetame üleslaetud faili ümber!!
    fs.rename(req.file.path, req.file.destination + fileName, (err) => {
      console.log(err);
    });
    sharp(req.file.destination + fileName)
      .resize(800, 600)
      .jpeg({ quality: 90 })
      .toFile("./public/Gallery/normal/" + fileName);
    sharp(req.file.destination + fileName)
      .resize(100, 100)
      .jpeg({ quality: 90 })
      .toFile("./public/Gallery/thumb/" + fileName);
    //salvestame andmebaasi!!
    let sqlreq =
      "INSERT INTO images (file_name, orig_name, alt_text, privacy, user_id) VALUES(?,?,?,?,?)";
    const userId = 1;
    conn.query(
      sqlreq,
      [
        fileName,
        req.file.originalname,
        req.body.altInput,
        req.body.privacyInput,
        userId,
      ],
      (err, result) => {
        if (err) {
          throw err;
        } else {
          console.log("andmed salvestati andmebaasi");
          res.render("photo_Upload");
        }
      }
    );
  }
});
app.get("/images", (req, res) => {
  let sqlreq =
    "SELECT file_name, orig_name, alt_text FROM images WHERE privacy=?";
  const privacy = 3;
  conn.query(sqlreq, [privacy], (err, result) => {
    if (err) {
      throw err;
    } else {
      images = result;
      res.render("images_gallery", { images });
    }
  });
});
app.get("/signUp", (req, res) => {
  let notice = "";
  let firstNameValue = "";
  let lastNameValue = "";
  let eMail = "";
  let birthDateValue = "";
  res.render("signup", {
    notice: notice,
    eMail: eMail,
    lastNameValue: lastNameValue,
    firstNameValue: firstNameValue,
    birthDateValue: birthDateValue,
  });
});
app.post("/signUp", (req, res) => {
  let notice = "Ootan andmeid";
  let firstNameValue = "";
  let lastNameValue = "";
  let eMail = "";
  console.log(req.body);
  if (
    !req.body.firstNameInput ||
    !req.body.lastNameInput ||
    !req.body.birthDateInput ||
    !req.body.emailInput ||
    !req.body.genderInput ||
    req.body.passwordInput.length < 8 ||
    req.body.confirmPasswordInput !== req.body.passwordInput
  ) {
    eMail = req.body.emailInput;
    firstNameValue = req.body.firstNameInput;
    lastNameValue = req.body.lastNameInput;
    birthDateValue = req.body.birthDateInput;
    console.log("Andmeid on puudu või paroolid ei kattu");
    notice = "Andmeid on puudu, parool liiga lühike või paroolid ei kattu";
    res.render("signup", {
      notice: notice,
      eMail: eMail,
      lastNameValue: lastNameValue,
      firstNameValue: firstNameValue,
      birthDateValue: birthDateValue,
    });
  } //kui andmetes viga ... lõppeb
  else {
    let idreq = "SELECT id FROM users WHERE email = ?";
    conn.query(idreq, [req.body.emailInput], (err, idres) => {
      if (err) {
        notice = "tehniline viga kasutajate vaatamisel";
        res.render("singup", { notice: notice });
      } else if (idres[0] != null) {
        firstNameValue = req.body.firstNameInput;
        lastNameValue = req.body.lastNameInput;
        birthDateValue = req.body.birthDateInput;
        notice = "kasutaja juba olemas";
        res.render("signup", {
          notice: notice,
          eMail: eMail,
          lastNameValue: lastNameValue,
          firstNameValue: firstNameValue,
          birthDateValue: birthDateValue,
        });
      } else {
        notice = "Andmed sisestatud";
        //loome parooliräsi jaoks "soola"
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            notice =
              "Tehniline viga parooli krüpteerimisel, kasutajakontot ei loodud";
            res.render("signup", {
              notice: notice,
              eMail: eMail,
              lastNameValue: lastNameValue,
              firstNameValue: firstNameValue,
              birthDateValue: birthDateValue,
            });
          } else {
            //krüpeerime parooli ->
            bcrypt.hash(req.body.passwordInput, salt, (err, pwdhash) => {
              if (err) {
                notice = "Tehniline viga, kasutajakontot ei loodud";
                res.render("signup", {
                  notice: notice,
                  eMail: eMail,
                  lastNameValue: lastNameValue,
                  firstNameValue: firstNameValue,
                  birthDateValue: birthDateValue,
                });
              } else {
                let sqlreq =
                  "INSERT INTO users ( first_name, last_name, birth_date, gender, email, password ) VALUES (?,?,?,?,?,?)";
                conn.execute(
                  sqlreq,
                  [
                    req.body.firstNameInput,
                    req.body.lastNameInput,
                    req.body.birthDateInput,
                    req.body.genderInput,
                    req.body.emailInput,
                    pwdhash,
                  ],
                  (err, result) => {
                    if (err) {
                      notice =
                        "tehniline viga konto loomisel ja andmebaasi kirjutamisel, kasutajat ei loodud";
                      res.render("signup", {
                        notice: notice,
                        eMail: eMail,
                        lastNameValue: lastNameValue,
                        firstNameValue: firstNameValue,
                        birthDateValue: birthDateValue,
                      });
                    } else {
                      notice =
                        "kasutaja " + req.body.emailInput + " edukalt loodud";
                      res.render("signup", {
                        notice: notice,
                        eMail: eMail,
                        lastNameValue: lastNameValue,
                        firstNameValue: firstNameValue,
                        birthDateValue: birthDateValue,
                      });
                    }
                  }
                ); //conn.execute ... lõppeb
              }
            }); //hash ... lõppeb
          }
        }); //genSalt ... lõppeb
        console.log(req.body);
      } //kui andmed korras ... lõppeb
      //res.render("signup", { notice: notice });
    });
  }
});
app.post("/", (req, res) => {
  let notice = "";
  const semestrist = dtEt.semester("9-2-2024");
  if (!req.body.emailInput || !req.body.passwordInput) {
    console.log("andmeid puudu");
    notice = "sisselogimise andmeid on puudu";
    //const semestrist = dtEt.semester("9-2-2024");
    res.render("index", { semestrist, notice: notice });
  } else {
    let sqlReq = "SELECT id, password FROM users WHERE email = ?";
    conn.execute(sqlReq, [req.body.emailInput], (err, result) => {
      if (err) {
        console.log("viga andmebaasist lugemisel");
        notice = "tehniline viga, ei logitud sisse :(";
        res.render("index", { notice: notice, semestrist });
      } else {
        if (result[0] != null) {
          //juhul kui kasutaja on olemas ->
          //kontrollime sisestatud parooli ->
          bcrypt.compare(
            req.body.passwordInput,
            result[0].password,
            (err, comapreResult) => {
              if (err) {
                notice = "tehniline viga, ei logitud sisse :(";
                res.render("index", { notice: notice, semestrist });
              } else {
                //kas võrdlemisel õige või vale parool?? ->
                if (comapreResult) {
                  notice = "Oled sisse loginud";
                  console.log(
                    "Kasutaja " + req.body.emailInput + " on sisse logitud"
                  );
                  res.render("index", { notice: notice, semestrist });
                } else {
                  notice = "kasutajatunnus ja/või parool on vale";
                  res.render("index", { notice: notice, semestrist });
                }
              }
            }
          );
        } else {
          console.log("kasutajat ei ole olemas");
          notice = "kasutajatunnus ja/või parool on vale";
          res.render("index", { notice: notice, semestrist });
        }
      }
    }); //conn.execute...lõppeb
  }
});
app.get("/signIn", (req, res) => {
  res.render("signin");
});
app.post("/signIn", (req, res) => {
  let notice = "";
  if (!req.body.emailInput || !req.body.passwordInput) {
    console.log("andmeid puudu");
    notice = "sisselogimise andmeid on puudu";
    //const semestrist = dtEt.semester("9-2-2024");
    res.render("signin", { notice: notice });
  } else {
    let sqlReq = "SELECT id, password FROM users WHERE email = ?";
    conn.execute(sqlReq, [req.body.emailInput], (err, result) => {
      if (err) {
        console.log("viga andmebaasist lugemisel");
        notice = "tehniline viga, ei logitud sisse :(";
        res.render("signin", { notice: notice });
      } else {
        if (result[0] != null) {
          //juhul kui kasutaja on olemas ->
          //kontrollime sisestatud parooli ->
          bcrypt.compare(
            req.body.passwordInput,
            result[0].password,
            (err, comapreResult) => {
              if (err) {
                notice = "tehniline viga, ei logitud sisse :(";
                res.render("signin", { notice: notice });
              } else {
                //kas võrdlemisel õige või vale parool?? ->
                if (comapreResult) {
                  notice = "Oled sisse loginud";
                  console.log(
                    "Kasutaja " + req.body.emailInput + " on sisse logitud"
                  );
                  res.render("signin", { notice: notice });
                } else {
                  notice = "kasutajatunnus ja/või parool on vale";
                  res.render("signin", { notice: notice });
                }
              }
            }
          );
        } else {
          console.log("kasutajat ei ole olemas");
          notice = "kasutajatunnus ja/või parool on vale";
          res.render("signin", { notice: notice });
        }
      }
    }); //conn.execute...lõppeb
  }
});
app.listen(5133);
