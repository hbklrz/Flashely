var express = require("express");
var pm2 = require("pm2");
var router = express.Router();

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  const prefix = (process.env.PROCESS_SECRET || "DBP").toUpperCase() + "_";
  pm2.list(function (err, list) {
    if (err) return res.json({ Success: false, Message: err.message });
    const bots = list.filter(p => p.name.toUpperCase().startsWith(prefix) && p.pm2_env.status !== "online");
    if (bots.length === 0) return res.json({ Success: true, Message: "All bots are already running" });
    let started = 0;
    bots.forEach(bot => {
      pm2.restart(bot.name, () => {
        started++;
        if (started === bots.length) res.json({ Success: true, Message: `Started ${started} bot(s)` });
      });
    });
  });
});

module.exports = router;
