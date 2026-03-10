var express = require("express");
var pm2 = require("pm2");
var fs = require("fs");
var path = require("path");
var router = express.Router();

var up = path.join(__dirname, "../");

router.get("/:name", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  const name = req.params.name;
  const botPath = path.join(up, process.env.SECRET_PATH, name);
  const packageFile = path.join(botPath, "package.json");

  if (!fs.existsSync(botPath)) {
    return res.json({ Success: false, Message: `Bot directory '${name}' not found` });
  }

  if (!fs.existsSync(packageFile)) {
    return res.json({
      Success: false,
      Message: `No package.json found. Run npm init in ${botPath} first.`,
    });
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  } catch (e) {
    return res.json({ Success: false, Message: "Invalid package.json: " + e.message });
  }

  const entryFile = path.join(botPath, pkg.main || "index.js");
  if (!fs.existsSync(entryFile)) {
    return res.json({ Success: false, Message: `Entry file '${pkg.main || "index.js"}' not found` });
  }

  // Ensure logs directory exists
  const logsDir = path.join(up, process.env.SECRET_PATH, "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  const processName = `${(process.env.PROCESS_SECRET || "DBP").toUpperCase()}_${name}`;

  pm2.start(
    {
      name: processName,
      script: entryFile,
      watch: false,
      autorestart: false,
      min_uptime: 5000,
      max_restarts: parseInt(process.env.MAX_RELOADS) || 5,
      restart_delay: parseInt(process.env.RESTART_DELAY) || 1000,
      lines: parseInt(process.env.MAX_LOG_LINES) || 500,
      out_file: path.join(logsDir, `${name}.strout.log`),
      error_file: path.join(logsDir, `${name}.strerr.log`),
      max_memory_restart: `${Math.round(parseFloat(process.env.MAXIMUM_RAM_BYTES || 268435456) / 1000000)}M`,
    },
    function (err, apps) {
      if (err) {
        return res.json({ Success: false, Message: err.message || String(err) });
      }
      res.json({ Success: true, Message: `${name} started successfully` });
    }
  );
});

module.exports = router;
