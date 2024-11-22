const express = require("express");
const router = express.Router();
const dtEt = require("../date_time.js");

router.route("/").get((req, res) => {
    const weekDays = dtEt.dayEt();
    const dateNow = dtEt.dateEt();
    const timeNow = dtEt.timeEt();
    res.render("timenow", { nowWD: weekDays, nowD: dateNow, nowT: timeNow });
  });
module.exports = router;