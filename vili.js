const express = require("express");
const mysql = require("mysql2");
const dbInfo = require("../vp1_confiq.js");
const bodyparser = require("body-parser");

const conn = mysql.createConnection({
  host: dbInfo.confiqdata.host,
  user: dbInfo.confiqdata.user,
  password: dbInfo.confiqdata.passWord,
  database: dbInfo.confiqdata.dataBase,
});

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.render("vili.ejs");
});
app.get("/vili_insert", (req, res) => {
  let alert = "";
  let truck_nr = "";
  let weight_in = "";
  let weight_out = "";
  res.render("vili_insert", { alert, truck_nr, weight_in, weight_out });
});
app.post("/vili_insert", (req, res) => {
  let alert = "";
  let truck_nr = "";
  let weight_in = "";
  let weight_out = "";
  if (
    !req.body.truck_nr_insert ||
    !req.body.weight_in_insert ||
    !req.body.weight_out_insert
  ) {
    alert = "Osa andmeid sisestamata";
    let truck_nr = req.body.truck_nr_insert;
    let weight_in = req.body.weight_in_insert;
    let weight_out = req.body.weight_out_insert;
    res.render("vili_insert", { alert, truck_nr, weight_in, weight_out });
  } else {
    let sqlreq =
      "INSERT INTO vp1viljavedu (truck_nr, weight_in, weight_out) VALUES(?,?,?)";
    conn.execute(
      sqlreq,
      [
        req.body.truck_nr_insert,
        req.body.weight_in_insert,
        req.body.weight_out_insert,
      ],
      (err, result) => {
        if (err) {
          let alert = err.message;
          res.render("vili_insert", { alert, truck_nr, weight_in, weight_out });
        } else {
          let alert = "andmed on edastatud andmebaasi";
          res.render("vili_insert", { alert, truck_nr, weight_in, weight_out });
        }
      }
    );
  }
});
app.get("/kokkuvote", (req, res) => {
  let sqlreq = "SELECT id, truck_nr, weight_in, weight_out FROM vp1viljavedu";
  let vili = [];
  conn.execute(sqlreq, (err, result) => {
    if (err) {
      throw err;
    } else {
      for (let i = 0; i < result.length; i++) {
        vili.push({
          truckId: result[i].id,
          truck_nr: result[i].truck_nr,
          weight_in: result[i].weight_in,
          weight_out: result[i].weight_out,
          vilja_mass: result[i].weight_in - result[i].weight_out,
        });
      }
      res.render("vili_kokkuvote", { vili: vili });
    }
  });
});
app.post("/kokkuvote", (req, res) => {
  console.log(req.body);
  let vili = [];
  let sqlreq =
    "SELECT id, truck_nr, weight_in, weight_out FROM vp1viljavedu WHERE id = ?";
  conn.execute(sqlreq, [req.body.truck_nr_search], (err, result) => {
    if (err) {
      throw err;
    } else {
      for (let i = 0; i < result.length; i++) {
        vili.push({
          truckId: result[i].id,
          truck_nr: result[i].truck_nr,
          weight_in: result[i].weight_in,
          weight_out: result[i].weight_out,
          vilja_mass: result[i].weight_in - result[i].weight_out,
        });
      }
      res.render("truckSearch", { vili: vili });
    }
  });
});
app.get("/kokkuvõte/masin", (req, res) => {
  res.render("truckSearch");
});
app.listen(5133);
