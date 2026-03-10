var express = require("express");
var pm2 = require("pm2");
var path = require("path");
var fs = require("fs");
var router = express.Router();

var up = path.join(__dirname, "../");

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  var name = (req.body.name || "").trim();
  if (!name || name.includes("..")) return res.json({ Success: false, Message: "Invalid bot name" });

  var processName = `${(process.env.PROCESS_SECRET || "DBP").toUpperCase()}_${name}`;

  pm2.delete(processName, function (err) {
    // Continue even if PM2 delete fails (bot might not be registered)
    var botDir = path.join(up, process.env.SECRET_PATH, name);
    if (fs.existsSync(botDir)) {
      fs.rmSync(botDir, { recursive: true, force: true });
    }
    res.json({ Success: true, Message: `Bot '${name}' deleted successfully` });
  });
});

module.exports = router;
