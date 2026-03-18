const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getEducation,
  addSemester,
  updateSemester,
  deleteSemester,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/educationController');

const router = express.Router();

router.get('/', protect, getEducation);
router.post('/semesters', protect, addSemester);
router.put('/semesters/:semesterId', protect, updateSemester);
router.delete('/semesters/:semesterId', protect, deleteSemester);
router.post('/semesters/:semesterId/courses', protect, addCourse);
router.put('/semesters/:semesterId/courses/:courseId', protect, updateCourse);
router.delete('/semesters/:semesterId/courses/:courseId', protect, deleteCourse);

module.exports = router;
