const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { requireRole, ownerOnly } = require("../middleware/auth");

router.use(requireRole("student"));

router.post("/storeRequest/:projectId/:studentId", ownerOnly("studentId"), requestController.storeRequest);
router.put("/withdraw/:projectId/:studentId", ownerOnly("studentId"), requestController.withdrawRequest);
router.get("/sentRequests/:projectId/:studentId", ownerOnly("studentId"), requestController.getSentRequests);

module.exports = router;
