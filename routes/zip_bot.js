var express = require("express");
var path = require("path");
var fs = require("fs");
var { exec } = require("child_process");
var router = express.Router();
var up = path.join(__dirname, "../");

function doZip(req, res, name) {
  if (!name) return res.json({ Success: false, Message: "name required" });
  var botPath = path.join(up, process.env.SECRET_PATH || "bots", name);
  if (!fs.existsSync(botPath)) return res.json({ Success: false, Message: "Server not found" });
  var dbDir = path.join(up, "database");
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  var ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  var zipName = name + "-" + ts + ".zip";
  var zipPath = path.join(dbDir, zipName);
  exec("zip -r " + zipPath + " . --exclude='./node_modules/*' --exclude='./.git/*'", { cwd: botPath, timeout: 120000 }, function(err, stdout, stderr) {
    if (err) return res.json({ Success: false, Message: err.message || stderr });
    var stat = fs.statSync(zipPath);
    res.json({ Success: true, Message: "Backup created: " + zipName, Data: "database/" + zipName, Size: stat.size });
  });
}

router.get("/", function(req, res) { doZip(req, res, req.query.name); });
router.post("/", function(req, res) { doZip(req, res, req.body.name || req.query.name); });
router.get("/:name", function(req, res) { doZip(req, res, req.params.name); });
router.post("/:name", function(req, res) { doZip(req, res, req.params.name); });

module.exports = router;
