var express = require("express");
var { exec } = require("child_process");
var path = require("path");
var fs = require("fs");
var router = express.Router();

var up = path.join(__dirname, "../");

router.get("/:name", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  var name = req.params.name;
  if (!name || name.includes("..")) return res.json({ Success: false, Message: "Invalid bot name" });

  var botPath = path.join(up, process.env.SECRET_PATH, name);
  if (!fs.existsSync(botPath)) return res.json({ Success: false, Message: "Bot directory not found" });

  exec(`cd "${botPath}" && npm install 2>&1`, { timeout: 120000 }, function (err, stdout, stderr) {
    var output = (stdout || "") + (stderr || "");
    if (err && !output.includes("added")) {
      return res.json({ Success: false, Message: output.trim() || err.message });
    }
    res.json({ Success: true, Message: `Packages installed for ${name}` });
  });
});

module.exports = router;
