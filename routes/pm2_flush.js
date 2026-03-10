var express = require("express");
var pm2 = require("pm2");
var router = express.Router();

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  const { name, all } = req.body;

  if (all) {
    pm2.flush("all", (err) => {
      if (err) return res.json({ Success: false, Message: err.message });
      res.json({ Success: true, Message: "All PM2 logs flushed" });
    });
  } else if (name) {
    const fullName = `${(process.env.PROCESS_SECRET || "DBP").toUpperCase()}_${name}`;
    pm2.flush(fullName, (err) => {
      if (err) return res.json({ Success: false, Message: err.message });
      res.json({ Success: true, Message: `Logs flushed for ${name}` });
    });
  } else {
    res.json({ Success: false, Message: "Specify 'name' or 'all'" });
  }
});

module.exports = router;
