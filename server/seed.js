/**
 * seed.js — Migrate / sync JSON data into MongoDB
 * Run once (initial):   node server/seed.js
 * Force re-sync later:  node server/seed.js --force
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const Course   = require('./models/Course');
const coursesData = require('./data/courses.json');
const usersData   = require('./data/users.json');

const force = process.argv.includes('--force');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Users ──────────────────────────────────────────────────────────────────
  const existingUsers = await User.countDocuments();
  if (existingUsers === 0 || force) {
    if (force) await User.deleteMany({});
    const users = await Promise.all(
      usersData.map(async u => ({
        username: u.username,
        password: await bcrypt.hash(u.password, 10),
        role:     u.role,
        name:     u.name,
      }))
    );
    await User.insertMany(users);
    console.log(`✓ Seeded ${users.length} users`);
  } else {
    console.log(`  Users already seeded (${existingUsers} found), skipping`);
  }

  // ── Courses ────────────────────────────────────────────────────────────────
  const existingCourses = await Course.countDocuments();

  if (existingCourses === 0) {
    // Fresh seed
    const courses = coursesData.map(c => ({
      courseId:    c.id,
      area:        c.area,
      term:        c.term,
      course:      c.course,
      faculty:     c.faculty,
      credits:     c.credits ?? null,
      description: c.description || '',
    }));
    await Course.insertMany(courses);
    console.log(`✓ Seeded ${courses.length} courses`);
  } else {
    // Upsert all courses from JSON (updates existing, inserts new)
    const bulkOps = coursesData.map(c => ({
      updateOne: {
        filter: { courseId: c.id },
        update: {
          $set: {
            courseId:    c.id,
            area:        c.area,
            term:        c.term,
            course:      c.course,
            faculty:     c.faculty,
            credits:     c.credits ?? null,
            description: c.description || '',
          },
        },
        upsert: true,
      },
    }));
    const result = await Course.bulkWrite(bulkOps);
    console.log(`✓ Upserted courses — modified: ${result.modifiedCount}, upserted: ${result.upsertedCount}`);

    // Remove courses no longer in the JSON
    const jsonIds = coursesData.map(c => c.id);
    const deleted = await Course.deleteMany({ courseId: { $nin: jsonIds } });
    if (deleted.deletedCount > 0) {
      console.log(`✓ Removed ${deleted.deletedCount} course(s) no longer in data file`);
    }
  }

  await mongoose.disconnect();
  console.log('Done — MongoDB disconnected');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
