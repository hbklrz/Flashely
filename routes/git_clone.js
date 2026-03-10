var express = require("express");
var Terminal = require("system-commands");
var path = require("path");
var fs = require("fs");
var router = express.Router();

var up = path.join(__dirname, "../");

router.post("/", async function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  const { url, folder } = req.body;
  if (!url) return res.json({ Success: false, Message: "Repository URL required" });

  // Sanitize - allow only valid git URLs
  if (!/^https?:\/\//.test(url)) {
    return res.json({ Success: false, Message: "Only HTTP/HTTPS URLs allowed" });
  }

  const botsPath = path.join(up, process.env.SECRET_PATH);
  const cloneDir = folder || url.split("/").pop().replace(".git", "");

  // Prevent directory traversal
  if (cloneDir.includes("..") || cloneDir.includes("/")) {
    return res.json({ Success: false, Message: "Invalid folder name" });
  }

  if (fs.existsSync(path.join(botsPath, cloneDir))) {
    return res.json({ Success: false, Message: `Folder '${cloneDir}' already exists` });
  }

  try {
    const cmd = `cd "${botsPath}" && git clone "${url}" "${cloneDir}" 2>&1`;
    Terminal(cmd, (err, output) => {
      if (err) return res.json({ Success: false, Message: err.message || String(err) });
      res.json({ Success: true, Message: `Cloned into '${cloneDir}' successfully` });
    });
  } catch (e) {
    res.json({ Success: false, Message: e.message });
  }
});

module.exports = router;
