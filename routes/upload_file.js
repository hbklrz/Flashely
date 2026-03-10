var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();

var up = path.join(__dirname, "../");
var ALLOWED_EXT = [".js",".ts",".json",".txt",".md",".env",".css",".html",".sh",".py",".yaml",".yml",".zip",".png",".jpg",".gif",".svg"];

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.json({ Success: false, Message: "No file uploaded" });
  }

  var file = req.files.file;
  var uploadPath = (req.body.path || "").trim();

  if (!uploadPath || uploadPath.includes("..")) {
    return res.json({ Success: false, Message: "Invalid upload path" });
  }

  var ext = path.extname(file.name).toLowerCase();
  if (ext && !ALLOWED_EXT.includes(ext)) {
    return res.json({ Success: false, Message: `File type '${ext}' is not allowed` });
  }

  var targetDir = path.normalize(path.join(up, process.env.SECRET_PATH, uploadPath));
  var botsRoot = path.normalize(path.join(up, process.env.SECRET_PATH));

  if (!targetDir.startsWith(botsRoot)) {
    return res.json({ Success: false, Message: "Access denied" });
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  var destPath = path.join(targetDir, file.name);

  file.mv(destPath, function (err) {
    if (err) return res.json({ Success: false, Message: err.message });
    res.json({ Success: true, Message: `'${file.name}' uploaded successfully` });
  });
});

module.exports = router;
