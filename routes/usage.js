var express = require("express");
var System = require("systeminformation");
var os = require("os");
var router = express.Router();

router.get("/", async function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }

  try {
    const [load, mem, disk] = await Promise.all([
      System.currentLoad(),
      System.mem(),
      System.fsSize(),
    ]);

    const diskData = Array.isArray(disk) ? disk[0] : disk;

    res.json({
      Success: true,
      CPU: { load: Math.round(load.currentLoad || 0) },
      RAM: { total: mem.total, used: mem.used, free: mem.free, available: mem.available },
      Disk: { total: diskData?.size || 0, used: diskData?.used || 0, free: (diskData?.size || 0) - (diskData?.used || 0) },
      Uptime: os.uptime(),
    });
  } catch (e) {
    res.json({ Success: false, Message: e.message });
  }
});

module.exports = router;
