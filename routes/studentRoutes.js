const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { authenticate, authorizeRole } = require("../middleware/auth"); // Import the middleware
const upload = require("../middleware/upload");

// authenticate middleware for all routes
router.use(authenticate);

router.get("/", studentController.getAllStudents);

router.get("/:id", studentController.getStudentById);

router.post(
  "/",
  upload.single("photo"),
  authorizeRole("admin"),
  studentController.createStudent
);

router.put("/:id", upload.single("photo"), studentController.updateStudent);

router.delete("/:id", studentController.deleteStudent);

module.exports = router;
