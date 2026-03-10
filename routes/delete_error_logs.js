var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  var name = req.body.name;
  if (!name || name.includes("..")) return res.json({ Success: false, Message: "Invalid bot name" });
  var logPath = path.join(up, process.env.SECRET_PATH, "logs", `${name}.strerr.log`);
  try {
    if (fs.existsSync(logPath)) fs.writeFileSync(logPath, "", "utf8");
    res.json({ Success: true, Message: `Error logs cleared for ${name}` });
  } catch (e) {
    res.json({ Success: false, Message: e.message });
  }
});
module.exports = router;
