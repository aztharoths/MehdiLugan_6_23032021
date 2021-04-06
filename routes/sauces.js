const express = require("express");
const router = express.Router();

const saucesCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", auth, multer, saucesCtrl.createSauce);
router.get("/", auth, saucesCtrl.getAllSauce);
router.get("/:_id", auth, saucesCtrl.getSauce);
router.put("/:_id", auth, multer, saucesCtrl.updateSauce);
router.delete("/:_id", auth, saucesCtrl.deleteSauce);
router.post("/:_id/like", auth, saucesCtrl.likeSauce);

module.exports = router;
