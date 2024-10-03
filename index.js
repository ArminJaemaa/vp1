const express = require("express");
const dtEt = require("./date_time.js");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/", (req, res) => {
  //res.send("express läks täiesti käima");
  res.render("index.ejs");
});

app.get("/timenow", (req, res) => {
  const weekDays = dtEt.dayEt();
  const dateNow = dtEt.dateEt();
  const timeNow = dtEt.timeEt();
  res.render("timenow", { nowWD: weekDays, nowD: dateNow, nowT: timeNow });
});

app.listen(5133);
