var express = require("express");
var pm2 = require("pm2");
var router = express.Router();

router.get("/:name", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  var name = req.params.name;
  var fullName = (process.env.PROCESS_SECRET || "DBP").toUpperCase() + "_" + name;

  pm2.describe(fullName, function (err, data) {
    if (err || !data || data.length === 0) {
      return res.json({ Success: false, Message: "Bot not found in PM2" });
    }
    var app = data[0];
    var env = app.pm2_env || {};
    res.json({
      Success: true,
      Data: {
        App: {
          Name: name,
          Version: env.version || "—",
          Uptime: env.pm_uptime || 0,
          Pid: app.pid || 0,
          Status: env.status || "unknown",
          NodeVersion: env.node_version || "—",
          Entry: env.script || "—",
          Out_file: env.out_file || "—",
          Error_file: env.error_file || "—",
        },
        Server: {
          CPU: app.monit ? app.monit.cpu : 0,
          Memory: app.monit ? app.monit.memory : 0,
        },
      }
    });
  });
});
module.exports = router;
