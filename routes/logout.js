var express = require("express");
var router = express.Router();

router.post("/", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      return res.json({ Success: false, Message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ Success: true, Message: "Logged out successfully" });
  });
});

module.exports = router;
