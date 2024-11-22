const express = require("express");
const router = express.Router();
const {regVisit, addVisit, visitLog} = require("../controllers/regvisit_controllers");

router.route("/").get(regVisit);
router.route("/").post(addVisit);
router.route("/visitlog").get(visitLog);
module.exports = router;