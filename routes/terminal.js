var express = require("express");
var { exec } = require("child_process");
var router = express.Router();

// Dangerous commands to block
var BLOCKED_CMDS = ["rm -rf /", "mkfs", "dd if=/dev/zero", ":(){:|:&};:", "chmod 000 /", "shutdown", "reboot", "halt"];

router.post("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  var command = req.body.command;
  if (!command) return res.json({ Success: false, Message: "No command provided" });

  // Basic safety check
  if (BLOCKED_CMDS.some(blocked => command.includes(blocked))) {
    return res.json({ Success: false, output: "⚠️ Command blocked for safety" });
  }

  exec(command, {
    timeout: 15000, // 15s timeout
    maxBuffer: 1024 * 512, // 512KB output max
    cwd: process.env.HOME || "/",
  }, function (err, stdout, stderr) {
    var output = (stdout || "") + (stderr ? "\n" + stderr : "");
    res.json({
      Success: !err,
      output: output.trim() || (err ? err.message : "Command executed (no output)"),
    });
  });
});

module.exports = router;
