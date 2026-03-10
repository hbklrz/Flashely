var express = require("express");
var pm2 = require("pm2");
var router = express.Router();

// Fixed: support both GET and POST for stop
function doStop(req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  const name = req.params.name;
  const fullName = `${(process.env.PROCESS_SECRET || "DBP").toUpperCase()}_${name}`;

  pm2.stop(fullName, function (err, apps) {
    if (err) {
      return res.json({ Success: false, Message: err.message || String(err) });
    }
    res.json({ Success: true, Message: `${name} stopped successfully` });
  });
}

router.get("/:name", doStop);
router.post("/:name", doStop);

module.exports = router;
