const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const REVIEWS_FILE = path.join(__dirname, '../data/reviews.json');

function readReviews() {
  try { return JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8')); }
  catch { return {}; }
}
function writeReviews(data) {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2));
}

// GET /api/reviews/:courseId
router.get('/:courseId', (req, res) => {
  const data = readReviews();
  res.json(data[req.params.courseId] || []);
});

// POST /api/reviews/:courseId
router.post('/:courseId', (req, res) => {
  const { username, name, courseRating, profRating, comment } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });

  const data    = readReviews();
  const key     = req.params.courseId;
  if (!data[key]) data[key] = [];

  const review = {
    id:           Date.now(),
    username,
    name:         name || username,
    courseRating: Number(courseRating) || 0,
    profRating:   Number(profRating)   || 0,
    comment:      (comment || '').trim(),
    timestamp:    new Date().toISOString(),
  };
  data[key].unshift(review);
  writeReviews(data);
  res.status(201).json(review);
});

// DELETE /api/reviews/:courseId/:reviewId  (admin only — frontend enforces role)
router.delete('/:courseId/:reviewId', (req, res) => {
  const data = readReviews();
  const key  = req.params.courseId;
  if (!data[key]) return res.status(404).json({ error: 'Not found' });
  data[key] = data[key].filter(r => String(r.id) !== String(req.params.reviewId));
  writeReviews(data);
  res.json({ ok: true });
});

module.exports = router;
