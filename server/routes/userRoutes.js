const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { ownerOnly } = require("../middleware/auth");

router.get("/getUserData/:userId", ownerOnly("userId"), userController.getUserData);

module.exports = router;
