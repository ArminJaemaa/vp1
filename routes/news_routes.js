const express = require("express");
const router = express.Router(); //suur R on oluline!!!
const general = require("../general_fnc");
const {
  newsHome,
  add_news,
  adding_news,
  read_news,
} = require("../controllers/news_controllers");

//kõikidele masruutidele ühine vahevara kasutus ( checklogin )
router.use(general.checklogin);

//app.get("/news", (req, res) => {
router.route("/").get(newsHome);
router.route("/add_news").get(add_news);
router.route("/add_news").post(adding_news);
router.route("/news").get(read_news);
//router.route("/news/:page").get(newsOne);
module.exports = router;
