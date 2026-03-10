var express = require("express");
var fastFolderSize = require("fast-folder-size");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");

router.get("/:name", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  var name = req.params.name;
  if (!name || name.includes("..")) return res.json({ Success: false, Message: "Invalid name" });

  var dirPath = path.join(up, process.env.SECRET_PATH, name);
  if (!fs.existsSync(dirPath)) return res.json({ Success: false, Message: "Directory not found" });

  fastFolderSize(dirPath, function (err, bytes) {
    if (err) return res.json({ Success: false, Message: err.message });
    res.json({
      Success: true,
      Data: {
        Size: bytes || 0,
        TotalStorage: parseFloat(process.env.MAXIMUM_SSD_BYTES) || 1073741824,
        TotalRam: parseFloat(process.env.MAXIMUM_RAM_BYTES) || 268435456,
      }
    });
  });
});
module.exports = router;
