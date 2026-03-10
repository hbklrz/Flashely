require("dotenv").config();
var path = require("path");
var pm2 = require("pm2");
var fs = require("fs");

var IGNORE = ["misc", "test.js", "index.js", "loader.js"];
var INCLUDE = ["cache"];
var GREPPER = {};

// FIXED: Don't process.exit(2) - log warning and continue
// PM2 connect is handled in index.js, not here
pm2.connect(function (err) {
  if (err) {
    console.warn("[WARN] PM2 connect warning in loader:", err.message || err);
    // Don't exit - panel can still serve pages, PM2 routes will fail gracefully
  }
});

function __Search(dir) {
  try {
    fs.readdirSync(dir).forEach(function (file) {
      if (IGNORE.includes(file)) return;
      try {
        var stat = fs.statSync(path.join(dir, file));
        if (stat.isFile() || INCLUDE.indexOf(file) !== -1) {
          GREPPER[file.replace(".js", "")] = require(path.join(dir, file));
        } else if (stat.isDirectory()) {
          __Search(path.join(dir, file));
        }
      } catch (e) {
        console.warn("[WARN] Could not load module:", file, e.message);
      }
    });
  } catch (e) {
    console.warn("[WARN] Module search error:", e.message);
  }
}

__Search(__dirname);

for (var name in GREPPER) {
  var exporter = GREPPER[name];
  if (exporter && Object.prototype.hasOwnProperty.call(exporter, "func")) {
    module.exports[name] = exporter.func;
  } else {
    module.exports[name] = GREPPER[name];
  }
}
