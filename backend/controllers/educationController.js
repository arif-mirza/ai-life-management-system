const Education = require('../models/Education');

// @GET /api/education
const getEducation = async (req, res) => {
  try {
    const education = await Education.findOne({ user: req.user._id });
    if (!education) {
      return res.json({ success: true, data: { user: req.user._id, semesters: [] } });
    }
    res.json({ success: true, data: education });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/education/semesters
const addSemester = async (req, res) => {
  try {
    const { title, year, examDate, status } = req.body;
    if (!title || !year) return res.status(400).json({ success: false, message: 'Title and year are required' });

    let education = await Education.findOne({ user: req.user._id });
    if (!education) education = await Education.create({ user: req.user._id, semesters: [] });

    education.semesters.unshift({ title, year, examDate, status });
    await education.save();
    res.status(201).json({ success: true, data: education });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @PUT /api/education/semesters/:semesterId
const updateSemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const { title, year, examDate, status } = req.body;

    const education = await Education.findOne({ user: req.user._id });
    if (!education) return res.status(404).json({ success: false, message: 'Education record not found' });

    const semester = education.semesters.id(semesterId);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    if (title !== undefined) semester.title = title;
    if (year !== undefined) semester.year = year;
    if (examDate !== undefined) semester.examDate = examDate || null;
    if (status !== undefined) semester.status = status;

    await education.save();
    res.json({ success: true, data: education });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @DELETE /api/education/semesters/:semesterId
const deleteSemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const education = await Education.findOne({ user: req.user._id });
    if (!education) return res.status(404).json({ success: false, message: 'Education record not found' });

    const semester = education.semesters.id(semesterId);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    semester.remove();
    await education.save();
    res.json({ success: true, data: education });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/education/semesters/:semesterId/courses
const addCourse = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const { name, totalLectures, covered, examDate, status, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Course name is required' });

    const education = await Education.findOne({ user: req.user._id });
    if (!education) return res.status(404).json({ success: false, message: 'Education record not found' });

    const semester = education.semesters.id(semesterId);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    semester.courses.push({
      name,
      totalLectures,
      covered,
      examDate,
      status,
      notes
    });

    await education.save();
    res.status(201).json({ success: true, data: education });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @PUT /api/education/semesters/:semesterId/courses/:courseId
const updateCourse = async (req, res) => {
  try {
    const { semesterId, courseId } = req.params;
    const { name, totalLectures, covered, examDate, status, notes } = req.body;

    const education = await Education.findOne({ user: req.user._id });
    if (!education) return res.status(404).json({ success: false, message: 'Education record not found' });

    const semester = education.semesters.id(semesterId);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    const course = semester.courses.id(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (name !== undefined) course.name = name;
    if (totalLectures !== undefined) course.totalLectures = totalLectures;
    if (covered !== undefined) course.covered = covered;
    if (examDate !== undefined) course.examDate = examDate || null;
    if (status !== undefined) course.status = status;
    if (notes !== undefined) course.notes = notes;

    await education.save();
    res.json({ success: true, data: education });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @DELETE /api/education/semesters/:semesterId/courses/:courseId
const deleteCourse = async (req, res) => {
  try {
    const { semesterId, courseId } = req.params;
    const education = await Education.findOne({ user: req.user._id });
    if (!education) return res.status(404).json({ success: false, message: 'Education record not found' });

    const semester = education.semesters.id(semesterId);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    const course = semester.courses.id(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    course.remove();
    await education.save();
    res.json({ success: true, data: education });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getEducation,
  addSemester,
  updateSemester,
  deleteSemester,
  addCourse,
  updateCourse,
  deleteCourse
};
