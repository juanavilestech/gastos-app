const router = require("express").Router();
const controller = require("../controllers/ai.controller");

router.get("/analyze", controller.analyze);

module.exports = router;
