const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const COURSES_FILE = path.join(__dirname, '../data/courses.json');
let courses = require('../data/courses.json');

function saveCourses() {
  fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));
}

// GET /api/courses
// Query params: area, credits, faculty, search
router.get('/', (req, res) => {
  let result = [...courses];
  const { area, credits, faculty, search } = req.query;

  if (area) {
    const areas = area.split(',').map(a => a.trim().toLowerCase());
    result = result.filter(c => areas.includes(c.area.toLowerCase()));
  }

  if (credits) {
    const val = parseFloat(credits);
    result = result.filter(c => c.credits === val);
  }

  if (faculty) {
    const q = faculty.toLowerCase();
    result = result.filter(c => c.faculty.toLowerCase().includes(q));
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.course.toLowerCase().includes(q) ||
      c.faculty.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// GET /api/courses/meta — returns unique areas, faculties, credit values
router.get('/meta', (req, res) => {
  const areas = [...new Set(courses.map(c => c.area))].sort();
  const faculties = [...new Set(courses.map(c => c.faculty))].sort();
  const creditValues = [...new Set(courses.map(c => c.credits).filter(Boolean))].sort((a, b) => a - b);
  res.json({ areas, faculties, creditValues });
});

// PUT /api/courses/:id  (admin: update course details)
router.put('/:id', (req, res) => {
  const id  = parseInt(req.params.id, 10);
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });

  const allowed = ['course', 'faculty', 'area', 'term', 'credits', 'description'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) courses[idx][field] = req.body[field];
  });
  saveCourses();
  res.json(courses[idx]);
});

module.exports = router;
