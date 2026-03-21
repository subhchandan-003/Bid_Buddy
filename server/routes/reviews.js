const express = require('express');
const Review  = require('../models/Review');
const Course  = require('../models/Course');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/:courseId — get all reviews for a course (numeric courseId)
router.get('/:courseId', async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: parseInt(req.params.courseId, 10) });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const reviews = await Review.find({ course: course._id }).sort({ timestamp: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:courseId — submit a review (auth required)
router.post('/:courseId', requireAuth, async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: parseInt(req.params.courseId, 10) });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const { courseRating, profRating, comment } = req.body;
    const review = await Review.create({
      course:       course._id,
      user:         req.user.id,
      username:     req.user.username,
      name:         req.user.name,
      courseRating: Number(courseRating) || 0,
      profRating:   Number(profRating)   || 0,
      comment:      (comment || '').trim(),
      timestamp:    new Date(),
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reviews/:courseId/:reviewId — edit own review (auth required)
router.put('/:courseId/:reviewId', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (String(review.user) !== String(req.user.id))
      return res.status(403).json({ error: 'You can only edit your own reviews' });

    const { courseRating, profRating, comment } = req.body;
    if (courseRating !== undefined) review.courseRating = Number(courseRating);
    if (profRating   !== undefined) review.profRating   = Number(profRating);
    if (comment      !== undefined) review.comment      = comment.trim();
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:courseId/:reviewId — admin deletes any, student deletes own
router.delete('/:courseId/:reviewId', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = String(review.user) === String(req.user.id);
    if (!isAdmin && !isOwner)
      return res.status(403).json({ error: 'Not authorised to delete this review' });

    await review.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
