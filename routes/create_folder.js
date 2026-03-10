var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  var filePath = req.body.path || "";
  var name = (req.body.name || "").trim();
  if (!name || name.includes("..") || name.includes("/")) return res.json({ Success: false, Message: "Invalid folder name" });

  var targetPath = path.normalize(path.join(up, process.env.SECRET_PATH, filePath, name));
  var botsRoot = path.normalize(path.join(up, process.env.SECRET_PATH));
  if (!targetPath.startsWith(botsRoot)) return res.json({ Success: false, Message: "Access denied" });

  try {
    if (fs.existsSync(targetPath)) return res.json({ Success: false, Message: "Folder already exists" });
    fs.mkdirSync(targetPath, { recursive: true });
    res.json({ Success: true, Message: `Folder '${name}' created` });
  } catch (e) {
    res.json({ Success: false, Message: e.message });
  }
});
module.exports = router;
