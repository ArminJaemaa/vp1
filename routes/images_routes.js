const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const general = require("../general_fnc");

//kontrollerid
const {
  imagesOpenPage,
  imagesPage,
} = require("../controllers/images_controllers");

//igale marsruudile oma osa nagu seni index failis

router.route("/").get(imagesOpenPage);

router.route("/:page").get(imagesPage);

module.exports = router;
