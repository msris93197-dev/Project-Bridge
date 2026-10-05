const express = require("express");
const router = express.Router();
const { ownerOnly } = require("../middleware/auth");
const controller = require("../controllers/notificationController");

router.get("/:userId", ownerOnly("userId"), controller.list);
router.put("/:userId/readAll", ownerOnly("userId"), controller.markAllRead);

module.exports = router;
