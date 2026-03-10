var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();

var up = path.join(__dirname, "../");

function searchInDir(dir, query, results = [], depth = 0) {
  if (depth > 5) return results;
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      if (item === "node_modules" || item === ".git" || item === "logs") return;
      const fullPath = path.join(dir, item);
      const relPath = fullPath.replace(up, "");
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          searchInDir(fullPath, query, results, depth + 1);
        } else if (item.toLowerCase().includes(query.toLowerCase())) {
          results.push({ name: item, path: relPath, size: stat.size, isDir: false });
        }
      } catch(e) {}
    });
  } catch(e) {}
  return results;
}

router.get("/", function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  const query = req.query.q;
  if (!query || query.length < 2) return res.json({ Success: false, Message: "Query too short" });

  const botsPath = path.join(up, process.env.SECRET_PATH);
  const results = searchInDir(botsPath, query);
  res.json({ Success: true, Data: results.slice(0, 50) });
});

module.exports = router;
