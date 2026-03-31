const router = require("express").Router();
const controller = require("../controllers/ai.controller");

router.get("/analyze", controller.analyze);
router.post("/ask", controller.ask);
router.post("/predict-category", controller.predictCategory);
router.post("/retrain", controller.retrain);

module.exports = router;
