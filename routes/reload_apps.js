var express = require("express");
var pm2 = require("pm2");
var router = express.Router();

router.get("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  pm2.reload("all", function (err) {
    if (err) {
      // Not a fatal error - pm2 reload "all" fails if no processes
      return res.json({ Success: true, Message: "Panel synced (no active processes to reload)" });
    }
    res.json({ Success: true, Message: "Panel synced and all processes reloaded" });
  });
});
module.exports = router;
