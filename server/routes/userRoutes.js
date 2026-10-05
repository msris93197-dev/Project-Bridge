const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/getUserData/:userId", userController.getUserData);

module.exports = router;
