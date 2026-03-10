var express = require("express");
var pm2 = require("pm2");
var router = express.Router();

router.get("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  pm2.list(function (err, list) {
    if (err) return res.json({ Success: false, Message: err.message });
    res.json({ Success: true, Data: list.map(p => ({
      name: p.name,
      pid: p.pid,
      status: p.pm2_env.status,
      cpu: p.monit.cpu,
      memory: p.monit.memory,
      uptime: p.pm2_env.pm_uptime,
    }))});
  });
});

module.exports = router;
