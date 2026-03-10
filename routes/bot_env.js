var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var up = path.join(__dirname, "../");

function getEnvPath(name) {
  return path.join(up, process.env.SECRET_PATH || "bots", name, ".env");
}

router.get("/:name", function(req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  var envPath = getEnvPath(req.params.name);
  if (!fs.existsSync(envPath)) return res.json({ Success: true, Data: "" });
  try {
    res.json({ Success: true, Data: fs.readFileSync(envPath, "utf8") });
  } catch(e) { res.json({ Success: false, Message: e.message }); }
});

router.post("/:name", function(req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  var envPath = getEnvPath(req.params.name);
  var content = req.body.env !== undefined ? req.body.env : (typeof req.body === "string" ? req.body : "");
  try {
    var dir = path.dirname(envPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(envPath, content, "utf8");
    res.json({ Success: true, Message: ".env saved" });
  } catch(e) { res.json({ Success: false, Message: e.message }); }
});

module.exports = router;
