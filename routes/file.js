var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");

// Serve files for download — used for backup ZIPs, log downloads etc.
// GET /file?path=database/mybot.zip
router.get("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.status(403).send("Unauthorized");
  const rel = req.query.path;
  if (!rel) return res.status(400).send("Missing path");
  const filePath = path.resolve(up, rel);
  // Must stay within project dir
  if (!filePath.startsWith(path.resolve(up))) return res.status(403).send("Forbidden");
  if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
  res.download(filePath);
});

module.exports = router;
