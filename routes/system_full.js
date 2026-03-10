var express = require("express");
var router = express.Router();
var os = require("os");
var { exec } = require("child_process");

router.get("/", function(req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username)
    return res.json({ Success: false, Message: "Not authenticated" });
  try {
    var cpus = os.cpus();
    var totalMem = os.totalmem();
    var freeMem = os.freemem();
    var usedMem = totalMem - freeMem;
    // CPU load average as percentage
    var load = os.loadavg()[0];
    var cpuPct = Math.min(100, Math.round((load / cpus.length) * 100));
    
    // Disk info via df
    exec("df -B1 / 2>/dev/null | tail -1 | awk '{print $2,$3}'", function(err, stdout) {
      var diskTotal = 0, diskUsed = 0;
      if (!err && stdout.trim()) {
        var parts = stdout.trim().split(/\s+/);
        diskTotal = parseInt(parts[0]) || 0;
        diskUsed = parseInt(parts[1]) || 0;
      }
      // Kernel & hostname
      exec("uname -r 2>/dev/null", function(err2, kernel) {
        // node version
        exec("node --version 2>/dev/null", function(err3, nodeVer) {
          // IP
          var nets = os.networkInterfaces();
          var ip = "127.0.0.1";
          for (var key in nets) {
            if (key === "lo") continue;
            var found = nets[key].find(function(a) { return a.family === "IPv4" && !a.internal; });
            if (found) { ip = found.address; break; }
          }
          res.json({
            Success: true,
            Data: {
              cpu: cpuPct,
              ramUsed: usedMem,
              ramTotal: totalMem,
              diskUsed: diskUsed,
              diskTotal: diskTotal,
              uptime: Math.floor(os.uptime()),
              os: os.type() + " " + os.release(),
              kernel: (kernel || "").trim(),
              hostname: os.hostname(),
              cpuModel: cpus[0] ? cpus[0].model : "Unknown",
              cores: cpus.length,
              arch: os.arch(),
              node: (nodeVer || "").trim(),
              ip: ip,
            }
          });
        });
      });
    });
  } catch(e) {
    res.json({ Success: false, Message: e.message });
  }
});

module.exports = router;
