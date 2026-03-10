var express = require("express");
var Terminal = require("system-commands");
var path = require("path");
var router = express.Router();

var up = path.join(__dirname, "../");

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  const { name } = req.body;
  if (!name || name.includes("..")) {
    return res.json({ Success: false, Message: "Invalid bot name" });
  }

  const botPath = path.join(up, process.env.SECRET_PATH, name);
  const cmd = `cd "${botPath}" && git pull 2>&1`;

  Terminal(cmd, (err, output) => {
    if (err) return res.json({ Success: false, Message: err.message || String(err) });
    res.json({ Success: true, Message: output || "Already up to date" });
  });
});

module.exports = router;
