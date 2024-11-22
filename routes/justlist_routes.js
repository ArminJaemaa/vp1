const express = require("express");
const router = express.Router();
const fs = require("fs");
router.route("/").get((req, res) => {
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
module.exports = router;