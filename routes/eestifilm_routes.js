const express = require("express");
const router = express.Router();
const general = require("../general_fnc");
const {eestifilm, tegelased, lisaSeos, movies, sisestus, insert} = require("../controllers/eestifilm_controllers");

router.use(general.checklogin);

router.route("/").get(eestifilm);
router.route("/tegelased").get(tegelased);
router.route("/lisaSeos").get(lisaSeos);
router.route("/movies").get(movies);
router.route("/sisestus").get(sisestus);
router.route("/sisestus").post(insert);
//router.route("/lisaSeos").post(insertLisaSeos);

module.exports = router;