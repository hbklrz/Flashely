var express = require("express");
var pm2 = require("pm2");
var path = require("path");
var fs = require("fs");
var router = express.Router();

var up = path.join(__dirname, "../");

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  var name = (req.body.name || "").trim();
  var mainEntry = (req.body.main_entry || "index.js").trim();

  if (!name) return res.json({ Success: false, Message: "Bot name is required" });
  if (/[^a-zA-Z0-9_\-]/.test(name)) return res.json({ Success: false, Message: "Bot name can only contain letters, numbers, hyphens and underscores" });

  var botDir = path.join(up, process.env.SECRET_PATH, name);
  var processName = `${(process.env.PROCESS_SECRET || "DBP").toUpperCase()}_${name}`;

  // Create directory if it doesn't exist
  if (!fs.existsSync(botDir)) {
    fs.mkdirSync(botDir, { recursive: true });
    // Create basic package.json
    fs.writeFileSync(path.join(botDir, "package.json"), JSON.stringify({
      name: name,
      version: "1.0.0",
      main: mainEntry,
      description: "Discord bot managed by Bot Panel",
      scripts: { start: `node ${mainEntry}` }
    }, null, 2));
    // Create placeholder entry file
    if (!fs.existsSync(path.join(botDir, mainEntry))) {
      fs.writeFileSync(path.join(botDir, mainEntry),
        `// ${name} - Discord Bot\n// Created by Bot Panel Enhanced\nconsole.log('${name} is starting...');\n`);
    }
  }

  pm2.describe(processName, function (err, desc) {
    if (desc && desc.length > 0) {
      return res.json({ Success: false, Message: `Bot '${name}' already exists in PM2` });
    }

    pm2.start(
      {
        name: processName,
        script: path.join(botDir, mainEntry),
        autorestart: false,
        watch: false,
        out_file: path.join(up, process.env.SECRET_PATH, "logs", `${name}.strout.log`),
        error_file: path.join(up, process.env.SECRET_PATH, "logs", `${name}.strerr.log`),
      },
      function (startErr) {
        if (startErr) {
          // App registered even if start fails
        }
        pm2.stop(processName, function () {
          res.json({ Success: true, Message: `Bot '${name}' created successfully` });
        });
      }
    );
  });
});

module.exports = router;
