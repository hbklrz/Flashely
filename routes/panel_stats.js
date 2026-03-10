var express = require("express");
var Modules = require("../modules/loader");
var path = require("path");
var router = express.Router();
var SETTINGS = require("../settings.json");
var up = path.join(__dirname, "../");

router.get("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  Modules.getDirectories(path.join(up, process.env.SECRET_PATH), function (dirs) {
    res.json({
      Success: true,
      Message: "Fetched successfully",
      Data: {
        Env: {
          SecretPath: process.env.SECRET_PATH,
          MaxRam: parseFloat(process.env.MAXIMUM_RAM_BYTES) || 268435456,
          MaxSSD: parseFloat(process.env.MAXIMUM_SSD_BYTES) || 1073741824,
          Username: process.env.ADMIN_USERNAME,
          Port: parseFloat(process.env.PORT) || 3000,
          Path: path.basename(up),
        },
        Dirs: Array.isArray(dirs) ? dirs.filter(function (n) { return n !== "logs"; }) : [],
      }
    });
  });
});
module.exports = router;
