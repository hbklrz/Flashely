var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");

router.get("/:name", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  var name = req.params.name;
  if (!name || name.includes("..")) return res.json({ Success: false, Data: null });

  var logPath = path.join(up, process.env.SECRET_PATH, "logs", `${name}.strerr.log`);
  try {
    if (!fs.existsSync(logPath)) return res.json({ Success: true, Data: null });
    var content = fs.readFileSync(logPath, "utf8");
    var lines = content.split("\n");
    if (lines.length > 200) lines = lines.slice(-200);
    res.json({ Success: true, Data: lines.join("\n") });
  } catch (e) {
    res.json({ Success: false, Data: null, Message: e.message });
  }
});
module.exports = router;
