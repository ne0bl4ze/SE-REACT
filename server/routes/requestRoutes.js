const express = require("express");
const router = express.Router();

const controller = require("../controllers/requestController");

// ✅ FIXED: now function exists
router.get("/request/:id", controller.getRequestById);

router.post("/request-emergency", controller.createRequest);
router.post("/cancel-request/:id", controller.cancelRequest);

module.exports = router;