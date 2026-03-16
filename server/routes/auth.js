const express = require('express');
const router  = express.Router();
const users   = require('../data/users.json');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
});

module.exports = router;
