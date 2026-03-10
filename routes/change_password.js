var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();

router.post("/", function (req, res) {
  if (!req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  const { oldPass, newPass } = req.body;

  if (!oldPass || !newPass) {
    return res.json({ Success: false, Message: "All fields required" });
  }

  if (oldPass !== process.env.ADMIN_PASSWORD) {
    return res.json({ Success: false, Message: "Current password is incorrect" });
  }

  if (newPass.length < 6) {
    return res.json({ Success: false, Message: "New password must be at least 6 characters" });
  }

  // Update .env file
  const envPath = path.join(__dirname, "../.env");
  try {
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
    if (content.includes("ADMIN_PASSWORD=")) {
      content = content.replace(/^ADMIN_PASSWORD=.*/m, `ADMIN_PASSWORD=${newPass}`);
    } else {
      content += `\nADMIN_PASSWORD=${newPass}`;
    }
    fs.writeFileSync(envPath, content, "utf8");
    process.env.ADMIN_PASSWORD = newPass;
    res.json({ Success: true, Message: "Password changed. Restart panel to apply." });
  } catch (e) {
    res.json({ Success: false, Message: e.message });
  }
});

module.exports = router;
