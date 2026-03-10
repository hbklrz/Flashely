"use strict";
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const up = path.join(__dirname);

// 1. Static files FIRST — before any middleware
app.use(express.static(path.join(up, "public")));

// 2. Body parsers
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.text({ type: "text/plain", limit: "50mb" }));

// 3. Session
app.use(session({
  secret: process.env.SESSION_SECRET || "flashely-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// 4. Public routes
app.get("/login", (req, res) => {
  if (process.env.LOGIN_REQUIRED !== "true") return res.redirect("/dashboard");
  if (req.session.username) return res.redirect("/dashboard");
  res.sendFile(path.join(up, "pages", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "admin123";
  if (username === validUser && password === validPass) {
    req.session.username = username;
    return res.json({ Success: true, Message: "Login successful" });
  }
  return res.json({ Success: false, Message: "Invalid username or password" });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// 5. Auth wall
app.use((req, res, next) => {
  if (process.env.LOGIN_REQUIRED !== "true") return next();
  if (req.session.username) return next();
  const isApi = req.headers.accept && req.headers.accept.includes("application/json");
  if (isApi) return res.status(401).json({ Success: false, Message: "Not authenticated" });
  res.redirect("/login");
});

// 6. File download
app.get("/file", (req, res) => {
  const relPath = req.query.path || "";
  if (!relPath) return res.status(400).send("Path required");
  const abs = path.resolve(up, relPath);
  if (!abs.startsWith(path.resolve(up))) return res.status(403).send("Access denied");
  if (!fs.existsSync(abs)) return res.status(404).send("Not found");
  res.download(abs);
});

// 7. API routes
const routeList = [
  "start","stop","restart","kill","list-apps","create_app","delete_app","update_main",
  "dirs","file_content","update_file","create_file","create_folder","rename_dir","delete_path",
  "upload_file","terminal","output_log","error_log","log","delete_logs","delete_error_logs",
  "zip_bot","list_backups","bot_env","npm_install","install_package","git_clone","git_pull",
  "system_full","network_stats","info"
];

for (const name of routeList) {
  const rp = path.join(up, "routes", name + ".js");
  if (fs.existsSync(rp)) {
    try { app.use("/" + name, require(rp)); }
    catch (e) { console.warn("Route load failed:", name, "-", e.message); }
  }
}

// 8. Page routes
const pageList = [
  "dashboard","console","files","logs","startup","database",
  "environment","stats","domains","backups","settings-server"
];

for (const page of pageList) {
  app.get("/" + page, (req, res) => {
    const fp = path.join(up, "pages", page + ".html");
    if (!fs.existsSync(fp)) return res.status(404).send("Page not found: " + page);
    res.sendFile(fp);
  });
}

app.get("/", (req, res) => res.redirect("/dashboard"));

app.use((req, res) => {
  res.status(404).json({ Success: false, Message: "Not found: " + req.path });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ Success: false, Message: err.message });
});

app.listen(PORT, () => {
  console.log("\n  Flashely Panel v3.0 — Hyfo Technology");
  console.log("  Running at http://localhost:" + PORT);
  console.log("  Login required:", process.env.LOGIN_REQUIRED || "false", "\n");
});
