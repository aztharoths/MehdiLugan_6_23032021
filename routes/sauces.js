const express = require("express");
const router = express.Router();

const saucesCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", auth, multer, saucesCtrl.createSauce);
router.get("/", saucesCtrl.getAllSauce);
router.get("/:_id", saucesCtrl.getSauce);
router.put("/:_id", saucesCtrl.updateSauce);
router.delete("/:_id", saucesCtrl.deleteSauce);

module.exports = router;
