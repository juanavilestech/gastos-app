const router = require("express").Router();
const controller = require("../controllers/ai.controller");

router.get("/analyze", controller.analyze);
router.post("/ask", controller.ask);

module.exports = router;
