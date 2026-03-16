const express = require('express');
const cors    = require('cors');
const coursesRouter = require('./routes/courses');
const authRouter    = require('./routes/auth');
const reviewsRouter = require('./routes/reviews');

const app  = express();
const PORT = process.env.PORT || 5000;

// CORS_ORIGIN: set to your Vercel frontend URL in Railway env vars
// e.g. https://elective-dashboard.vercel.app
// Leave unset (or '*') during development
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: allowedOrigin || '*',
  credentials: true,
}));
app.use(express.json());

app.use('/api/courses', coursesRouter);
app.use('/api/auth',    authRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
