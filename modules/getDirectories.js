require("dotenv").config();
var fs = require("fs");

// FIXED: Added error handling, removed unnecessary deps (Terminal, chalk, pm2 - not needed here)
module.exports = function getDirectories(source, callback) {
  fs.readdir(source, { withFileTypes: true }, function (err, files) {
    if (err) {
      return callback([]);
    }
    var dirs = files
      .filter(function (dirent) { return dirent.isDirectory(); })
      .map(function (dirent) { return dirent.name; });
    callback(dirs);
  });
};
