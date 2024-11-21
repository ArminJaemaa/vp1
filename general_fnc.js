exports.checklogin = function (req, res, next) {
  if (req.session != null) {
    if (req.session.userId) {
      console.log("login, sees kasutaja: " + req.session.userId);
      next();
    } else {
      console.log("login not detected");
      res.redirect("/");
    }
  } else {
    console.log("session not detected");
    res.redirect("/");
  }
};