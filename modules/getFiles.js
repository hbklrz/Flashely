require("dotenv").config();
var fs = require("fs");

// FIXED: Was using global variables 'data' and 'json' without var/let/const
// causing race conditions when multiple requests hit simultaneously
module.exports = function getFiles(source, callback) {
  if (!fs.existsSync(source)) {
    return callback(false);
  }
  try {
    var stat = fs.lstatSync(source);
    if (!stat.isDirectory()) {
      return callback(false);
    }
  } catch (e) {
    return callback(false);
  }

  fs.readdir(source, { withFileTypes: true }, function (err, files) {
    if (err) {
      return callback(false);
    }
    // FIXED: local variable, not global
    var data = [];
    files.forEach(function (file) {
      try {
        // FIXED: direct property access instead of JSON.parse(JSON.stringify())
        data.push({
          Name: file.name,
          isDirectory: file.isDirectory()
        });
      } catch (e) {}
    });
    callback(data);
  });
};
