const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipment');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const existing = await Equipment.findOne({ serialNumber: req.body.serialNumber });
    if (existing) {
      return res.status(400).json({ msg: 'Serial Number already exists' });
    }

    const newEquipment = new Equipment(req.body);
    const savedEquipment = await newEquipment.save();

    res.status(201).json(savedEquipment);
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { department, status } = req.query;
    let filter = {};

    if (department) filter.department = department;
    if (status) filter.status = status;

    const equipment = await Equipment.find(filter)
      .populate('assignedTo', 'name email')
      .populate('team', 'name');
      
    res.json(equipment);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


module.exports = router;