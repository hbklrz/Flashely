var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");
router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  var filePath = req.body.path;
  var content = req.body.content !== undefined ? req.body.content : "";
  if (!filePath) return res.json({ Success: false, Message: "Path required" });
  var targetPath = path.resolve(up, filePath);
  if (!targetPath.startsWith(path.resolve(up)))
    return res.json({ Success: false, Message: "Access denied" });
  try {
    var dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(targetPath, content, "utf8");
    res.json({ Success: true, Message: "File created" });
  } catch (e) { res.json({ Success: false, Message: e.message }); }
});
module.exports = router;
