const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const newTeam = new Team(req.body);
    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find().populate('members', 'name email');
    res.json(teams);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;