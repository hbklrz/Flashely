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
  var main = (req.body.main || "").trim();
  if (!name || !main) return res.json({ Success: false, Message: "Name and main entry required" });
  if (name.includes("..") || main.includes("..")) return res.json({ Success: false, Message: "Invalid input" });

  var pkgPath = path.join(up, process.env.SECRET_PATH, name, "package.json");
  if (!fs.existsSync(pkgPath)) return res.json({ Success: false, Message: "package.json not found for " + name });

  try {
    var pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.main = main;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf8");
    res.json({ Success: true, Message: `Main entry updated to '${main}'` });
  } catch (e) {
    res.json({ Success: false, Message: e.message });
  }
});
module.exports = router;
