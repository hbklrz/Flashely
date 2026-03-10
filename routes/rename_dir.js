var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");
router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  var oldPath = path.resolve(up, req.body.old_path || "");
  var newPath = path.resolve(up, req.body.new_path || "");
  if (!oldPath.startsWith(path.resolve(up)) || !newPath.startsWith(path.resolve(up)))
    return res.json({ Success: false, Message: "Access denied" });
  try { fs.renameSync(oldPath, newPath); res.json({ Success: true, Message: "Renamed" }); }
  catch (e) { res.json({ Success: false, Message: e.message }); }
});
module.exports = router;
