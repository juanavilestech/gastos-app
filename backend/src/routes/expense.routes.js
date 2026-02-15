const express = require("express");
const router = express.Router();
const expressController = require("../controllers/expense.controller");

router.get("/", expressController.getAll);

module.exports = router;

