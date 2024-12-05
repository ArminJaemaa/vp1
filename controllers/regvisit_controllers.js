const fs = require("fs");
const dtEt = require("../date_time.js");

//@desc page for regvisit
//route GET /regvisit
//public

const regVisit = (req, res) => {
    console.log("Läbi kontrolleri");
    res.render("regvisit");
  };

//@desc page for regvisit
//route POST /regvisit
//public

const addVisit = (req, res) => {
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
  };

//@desc page for visitlog
//route GET /regvisit/visitlog
//public

const visitLog = (req, res) => {
    let visits = [];
    fs.readFile("public/textfiles/visitlog.txt", "utf8", (err, data) => {
      if (err) {
        throw err;
      } else {
        visits = data.split(";");
        res.render("visitlog", { h3: "külastus", listData: visits });
      }
    });
  };

module.exports = {regVisit, addVisit, visitLog};