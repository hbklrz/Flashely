var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");
function rmRf(p) {
  if (!fs.existsSync(p)) return;
  var stat = fs.statSync(p);
  if (stat.isDirectory()) {
    fs.readdirSync(p).forEach(f => rmRf(path.join(p, f)));
    fs.rmdirSync(p);
  } else { fs.unlinkSync(p); }
}
router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  var paths = req.body.data || [];
  if (!Array.isArray(paths) || !paths.length) return res.json({ Success: false, Message: "No paths provided" });
  var projectRoot = path.resolve(up);
  try {
    paths.forEach(p => {
      var abs = path.resolve(up, p);
      if (!abs.startsWith(projectRoot)) throw new Error("Access denied: " + p);
      rmRf(abs);
    });
    res.json({ Success: true, Message: paths.length + " item(s) deleted" });
  } catch (e) { res.json({ Success: false, Message: e.message }); }
});
module.exports = router;
