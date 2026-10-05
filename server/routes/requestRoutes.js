const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

router.post("/storeRequest/:projectId/:studentId", requestController.storeRequest);
router.get("/sentRequests/:projectId/:studentId", requestController.getSentRequests);

module.exports = router;