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
  if (!fs.existsSync(targetPath)) return res.json({ Success: false, Message: "Not found" });
  try {
    var items = fs.readdirSync(targetPath);
    var data = items.filter(n => !n.startsWith('.')).map(name => {
      var fp = path.join(targetPath, name);
      try {
        var stat = fs.statSync(fp);
        return { Name: name, isDirectory: stat.isDirectory(), Stats: { size: stat.size, mtime: stat.mtimeMs } };
      } catch(e) { return { Name: name, isDirectory: false, Stats: {} }; }
    });
    res.json({ Success: true, Data: data });
  } catch (e) { res.json({ Success: false, Message: e.message }); }
});
module.exports = router;
