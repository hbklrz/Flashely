var express = require("express");
var { exec } = require("child_process");
var path = require("path");
var fs = require("fs");
var router = express.Router();

var up = path.join(__dirname, "../");

// Blocked packages for security
var BLOCKED_PACKAGES = ["fs-extra", "rimraf", "shelljs"];

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  var name = req.body.name;
  var pkg = (req.body.package || "").trim();

  if (!name || !pkg) return res.json({ Success: false, Message: "Bot name and package required" });
  if (!/^[a-zA-Z0-9@/_\-\.]+$/.test(pkg)) return res.json({ Success: false, Message: "Invalid package name" });

  var botPath = path.join(up, process.env.SECRET_PATH, name);
  if (!fs.existsSync(botPath)) return res.json({ Success: false, Message: "Bot not found" });

  exec(`cd "${botPath}" && npm install ${pkg} 2>&1`, { timeout: 60000 }, function (err, stdout, stderr) {
    var out = (stdout || "") + (stderr || "");
    if (err && !out.includes("added")) {
      return res.json({ Success: false, Message: out.trim() || err.message });
    }
    res.json({ Success: true, Message: `${pkg} installed for ${name}` });
  });
});

module.exports = router;
