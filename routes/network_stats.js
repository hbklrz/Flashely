var express = require("express");
var System = require("systeminformation");
var router = express.Router();

router.get("/", async function (req, res) {
  if (process.env.LOGIN_REQUIRED === "true" && !req.session.username) {
    return res.json({ Success: false, Message: "Not authenticated" });
  }
  try {
    const [net, ifaces] = await Promise.all([
      System.networkStats(),
      System.networkInterfaces()
    ]);
    const stats = Array.isArray(net) ? net[0] : net;
    res.json({
      Success: true,
      Data: {
        rx_sec: stats?.rx_sec || 0,
        tx_sec: stats?.tx_sec || 0,
        rx_bytes: stats?.rx_bytes || 0,
        tx_bytes: stats?.tx_bytes || 0,
        iface: stats?.iface || "unknown",
      }
    });
  } catch (e) {
    res.json({ Success: false, Message: e.message });
  }
});

module.exports = router;
