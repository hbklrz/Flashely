var express = require("express");
var pm2 = require("pm2");
var router = express.Router();

router.get("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  var prefix = (process.env.PROCESS_SECRET || "DBP").toUpperCase() + "_";
  pm2.list(function (err, list) {
    if (err) return res.json([]);
    var secureData = [];
    list.forEach(function (app) {
      if (app.name && app.name.toUpperCase().startsWith(prefix)) {
        secureData.push({
          CPU: app.monit ? app.monit.cpu : 0,
          Memory: app.monit ? app.monit.memory : 0,
          Node_Version: app.pm2_env ? app.pm2_env.node_version : "—",
          Out_file: app.pm2_env ? app.pm2_env.out_file : "",
          Error_file: app.pm2_env ? app.pm2_env.error_file : "",
          App: {
            Name: app.name.replace(prefix, ""),
            Pid: app.pid || 0,
            Version: app.pm2_env ? app.pm2_env.version : "—",
            Entry: app.pm2_env ? app.pm2_env.script : "—",
            Status: app.pm2_env ? app.pm2_env.status : "unknown",
            Created: app.pm2_env ? app.pm2_env.created_at : 0,
            Created_Date: app.pm2_env ? new Date(app.pm2_env.created_at).toLocaleString() : "—",
          },
        });
      }
    });
    res.json(secureData);
  });
});
module.exports = router;
