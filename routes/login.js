var express = require("express");
var router = express.Router();

router.post("/", function (req, res) {
  // BUG FIX: Original code checked req.body.username TWICE (never checked password)
  if (!req.body.username) {
    return res.json({ Success: false, Message: "Username is required" });
  }
  if (!req.body.password) {  // FIXED: was checking username again
    return res.json({ Success: false, Message: "Password is required" });
  }

  if (
    req.body.username === process.env.ADMIN_USERNAME &&
    req.body.password === process.env.ADMIN_PASSWORD
  ) {
    req.session.username = req.body.username;
    req.session.save(function (err) {
      if (err) console.error("Session save error:", err);
      res.json({ Success: true, Message: "Logged in successfully" });
    });
  } else {
    res.json({ Success: false, Message: "Invalid username or password" });
  }
});

module.exports = router;
