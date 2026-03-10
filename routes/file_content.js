var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");
router.get("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  var reqPath = req.query.path || "";
  if (!reqPath) return res.json({ Success: false, Message: "Path required" });
  var targetPath = path.resolve(up, reqPath);
  if (!targetPath.startsWith(path.resolve(up)))
    return res.json({ Success: false, Message: "Access denied" });
  if (!fs.existsSync(targetPath)) return res.json({ Success: false, Message: "File not found" });
  try {
    var stat = fs.statSync(targetPath);
    if (stat.isDirectory()) return res.json({ Success: false, Message: "Is a directory" });
    if (stat.size > 5 * 1024 * 1024) return res.json({ Success: false, Message: "File too large" });
    res.json({ Success: true, Data: fs.readFileSync(targetPath, "utf8") });
  } catch (e) { res.json({ Success: false, Message: e.message }); }
});
module.exports = router;
