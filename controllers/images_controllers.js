const mysql = require("mysql2");
const dbInfo = require("../../vp1_confiq.js");
const async = require("async");

const conn = mysql.createConnection({
  host: dbInfo.confiqdata.host,
  user: dbInfo.confiqdata.user,
  password: dbInfo.confiqdata.passWord,
  database: dbInfo.confiqdata.dataBase,
});
//@desc opening page for gallery
//@route GET /gallery
//@access private

const imagesOpenPage = (req, res) => {
  res.redirect("/images/1");
};

const imagesPage = (req, res) => {
  let imagesLinks = "";
  let page = parseInt(req.params.page);
  if (page < 1) {
    page = 1;
  }
  const imageLimit = 5;
  let skip = 0;
  const privacy = 3;

  //teeme päringud, mida tuleb kindlalt üksteise järel teha
  const galleryPageTasks = [
    function (callback) {
      conn.execute(
        "SELECT COUNT(id) as photos FROM images WHERE privacy = ? AND deleted IS NULL",
        [privacy],
        (err, result) => {
          if (err) {
            return callback(err);
          } else {
            return callback(null, result);
          }
        }
      );
    },
    function (photoCount, callback) {
      console.log("Fotosid on: " + photoCount[0].photos);
      if ((page - 1) * imageLimit >= photoCount[0].photos) {
        page = Math.ceil(photoCount[0].photos / imageLimit);
      }
      //lingid on:
      if (page == 1) {
        imagesLinks = "eelmine leht &nbsp;&nbsp;&nbsp|&nbsp;&nbsp;&nbsp";
      } else {
        imagesLinks =
          '<a href="/images/' +
          (page - 1) +
          '"> eelmine leht</a> &nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;';
      }
      if (page * imageLimit > photoCount[0].photos) {
        imagesLinks += "järgmine leht";
      } else {
        imagesLinks +=
          '<a href="/images/' + (page + 1) + '"> järgmine leht</a>';
      }
      return callback(null, page);
    },
  ];
  //async waterfall
  async.waterfall(galleryPageTasks, (err, results) => {
    if (err) {
      throw err;
    } else {
      console.log(results);
    }
  });
  //Kui aadressis toodud lk on muudetud, oli vigane, siis ...
  /*   console.log(req.params.page);
  if (page != parseInt(req.params.page)) {
    console.log("LK muutus!!!");
    res.redirect("/images/" + page);
  }
 */
  skip = (page - 1) * imageLimit;
  let sqlReq =
    "SELECT file_name, alt_text FROM images WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC LIMIT ?,?";

  conn.query(sqlReq, [privacy, skip, imageLimit], (err, result) => {
    if (err) {
      throw err;
    } else {
      let images = result;
      res.render("images_gallery", { images, links: imagesLinks });
    }
  });
};
//res.render("gallery");

module.exports = {
  imagesOpenPage,
  imagesPage,
};
