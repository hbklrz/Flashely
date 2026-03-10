var fastFolderSize = require("fast-folder-size");

module.exports = function dirSize(path, callback) {
  fastFolderSize(path, function (err, bytes) {
    if (err) return callback(0);
    callback(bytes || 0);
  });
};
