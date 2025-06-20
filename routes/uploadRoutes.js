const express = require("express");
const router = express.Router();
const multer = require("multer");
const Report = require("../models/Report");
const { handleUpload } = require("../controllers/uploadController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  res.render("upload");
});

router.post(
  "/upload",
  upload.fields([{ name: "speedaf" }, { name: "speedo" }]),
  handleUpload
);
router.get("/history", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.render("history", { reports });
  } catch (err) {
    console.error("خطأ في جلب البيانات:", err);
    res.status(500).send("حدث خطأ أثناء جلب البيانات.");
  }
});
module.exports = router;
