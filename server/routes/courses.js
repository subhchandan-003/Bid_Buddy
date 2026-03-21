const express = require('express');
const Course  = require('../models/Course');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses
// Query: area (comma-sep), credits, faculty, search, term
router.get('/', async (req, res) => {
  try {
    const { area, credits, faculty, search, term } = req.query;
    const filter = {};

    if (area) {
      const areas = area.split(',').map(a => a.trim());
      filter.area = { $in: areas };
    }
    if (credits) {
      filter.credits = parseFloat(credits);
    }
    if (faculty) {
      filter.faculty = { $regex: faculty, $options: 'i' };
    }
    if (term) {
      filter.term = term;
    }
    if (search) {
      filter.$or = [
        { course:  { $regex: search, $options: 'i' } },
        { faculty: { $regex: search, $options: 'i' } },
        { area:    { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter).sort({ courseId: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/meta — unique areas, faculties, creditValues
router.get('/meta', async (req, res) => {
  try {
    const [areas, faculties, creditValues] = await Promise.all([
      Course.distinct('area'),
      Course.distinct('faculty'),
      Course.distinct('credits'),
    ]);
    res.json({
      areas:        areas.sort(),
      faculties:    faculties.sort(),
      creditValues: creditValues.filter(Boolean).sort((a, b) => a - b),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id — single course by numeric courseId
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: parseInt(req.params.id, 10) });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses — create a new course (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { courseId, area, term, course, faculty, credits, description } = req.body;
    if (!courseId || !area || !term || !course || !faculty)
      return res.status(400).json({ error: 'courseId, area, term, course and faculty are required' });

    const created = await Course.create({ courseId, area, term, course, faculty, credits, description });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A course with that ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/courses/:id — update a course (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowed = ['course', 'faculty', 'area', 'term', 'credits', 'description'];
    const update  = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    const updated = await Course.findOneAndUpdate(
      { courseId: parseInt(req.params.id, 10) },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Course not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/courses/:id — delete a course (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Course.findOneAndDelete({ courseId: parseInt(req.params.id, 10) });
    if (!deleted) return res.status(404).json({ error: 'Course not found' });
    res.json({ ok: true, deleted: deleted.courseId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
