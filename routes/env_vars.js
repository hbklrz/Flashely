var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  if (!req.session.username) return res.json({ Success: false, Message: "Not authenticated" });
  // Return safe subset of env vars (never expose passwords)
  const safe = {
    PORT: process.env.PORT,
    SECRET_PATH: process.env.SECRET_PATH,
    LOGIN_REQUIRED: process.env.LOGIN_REQUIRED,
    PROCESS_SECRET: process.env.PROCESS_SECRET,
    MAX_LOG_LINES: process.env.MAX_LOG_LINES,
    MAX_RELOADS: process.env.MAX_RELOADS,
    RESTART_DELAY: process.env.RESTART_DELAY,
    MAXIMUM_RAM_BYTES: process.env.MAXIMUM_RAM_BYTES,
    MAXIMUM_SSD_BYTES: process.env.MAXIMUM_SSD_BYTES,
  };
  res.json({ Success: true, Data: safe });
});

module.exports = router;
