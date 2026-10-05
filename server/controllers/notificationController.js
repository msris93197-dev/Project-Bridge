const notificationdb = require("../model/notificationSchema");

// Fire-and-forget helper used by other controllers; never breaks the main flow.
exports.notify = async (userId, message, link) => {
  try {
    await notificationdb.create({ userId, message, link });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

exports.list = async (req, res) => {
  const items = await notificationdb
    .find({ userId: req.params.userId })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(items);
};

exports.markAllRead = async (req, res) => {
  await notificationdb.updateMany({ userId: req.params.userId, read: false }, { read: true });
  res.json({ message: "ok" });
};
