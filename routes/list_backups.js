var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");
router.get("/:name", function(req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  var dbDir = path.join(up, "database");
  if (!fs.existsSync(dbDir)) return res.json({ Success: true, Data: [] });
  try {
    var files = fs.readdirSync(dbDir).filter(f => f.includes(req.params.name) && (f.endsWith('.zip') || f.endsWith('.tar.gz')));
    var data = files.map(name => {
      var fp = path.join(dbDir, name);
      var stat = fs.statSync(fp);
      return { name: name, path: "database/" + name, size: stat.size, created: stat.mtimeMs };
    }).sort((a,b) => b.created - a.created);
    res.json({ Success: true, Data: data });
  } catch(e) { res.json({ Success: false, Message: e.message }); }
});
module.exports = router;
