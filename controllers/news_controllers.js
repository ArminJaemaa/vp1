const mysql = require("mysql2");
const dbInfo = require("../../vp1_confiq.js");
const conn = mysql.createConnection({
    host: dbInfo.confiqdata.host,
    user: dbInfo.confiqdata.user,
    password: dbInfo.confiqdata.passWord,
    database: dbInfo.confiqdata.dataBase,
  });
const dtEt = require("../date_time.js");

//@desc home page for news section
//@route GET /news
//@access private

const newsHome = (req, res) => {
  console.log("töötab uudiste router KOOS KONTROLLERIGA");
  res.render("news_home");
};

//@desc page for adding news
//@route GET /news/add_news
//@access private

const add_news = (req, res) => {
  let notice = "";
  let newsText = "";
  let newsTitle = "";
  let expireDate = dtEt.expireDate();
  res.render("add_news", {
    notice: notice,
    expireDate: expireDate,
    newsText: newsText,
    newsTitle: newsTitle,
  });
};

//@desc adding news
//@route POST /news/add_news
//@access private

const adding_news = (req, res) => {
  let notice = "";
  let newsText = "";
  let newsTitle = "";
  let expireDate = dtEt.expireDate();
  let user = req.session.userId;
  if (!req.body.titleInput || req.body.titleInput.length < 3) {
    let notice = "Uudise pealkiri peab olema vähemalt 3 tähemärki";
    let newsText = req.body.newsInput;
    let newsTitle = req.body.titleInput;
    let expireDate = req.body.expireInput;
    res.render("add_news", {
      newsText: newsText,
      newsTitle: newsTitle,
      expireDate: expireDate,
      notice: notice,
    });
  } else if (!req.body.newsInput || req.body.newsInput.length < 10) {
    let notice = "Uudise pikkus peab olema vähemalt 10 tähemärki";
    let newsText = req.body.newsInput;
    let newsTitle = req.body.titleInput;
    let expireDate = req.body.expireInput;
    res.render("add_news", {
      newsText: newsText,
      notice: notice,
      newsTitle: newsTitle,
      expireDate: expireDate,
    });
  } else {
    let newsText = req.body.newsInput;
    let newsTitle = req.body.titleInput;
    let expireDate = req.body.expireInput;
    let sqlreq =
      "INSERT INTO News (news_title, news_text, expire_date, user_id) VALUES (?,?,?,?) ";
    conn.query(
      sqlreq,
      [newsTitle, newsText, expireDate, user],
      (err, sqlres) => {
        if (err) {
          throw err;
        } else {
          let notice = "Uudis salvestati andmebaasi";
          res.render("add_news", {
            notice,
            newsText: "",
            newsTitle: "",
            expireDate: dtEt.expireDate(),
          });
        }
      }
    );
  }
};

//@desc page for reading news
//@route GET /news/news
//@access private

const read_news = (req, res) => {
  let sqlreq =
    "SELECT news_title, news_text, news_date, expire_date FROM News ORDER BY id DESC";
  let news = [];
  conn.query(sqlreq, (err, sqlres) => {
    if (err) {
      throw err;
    } else {
      for (let i = 0; i < sqlres.length; i++) {
        news.push({
          news_title: sqlres[i].news_title,
          news_text: sqlres[i].news_text,
          news_date: dtEt.givenDate(sqlres[i].news_date),
          expire_date: dtEt.givenDate(sqlres[i].expire_date),
        });
      }
      res.render("news", { news: news });
    }
  });
  //res.render("news");
};

module.exports = {
  newsHome,
  add_news,
  adding_news,
  read_news,
};
