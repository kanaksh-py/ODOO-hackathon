const express = require('express');
const router = express.Router();
const Request = require('../models/request');
const Equipment = require('../models/equipment');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { subject, description, equipment: equipmentId, type, priority, scheduledDate } = req.body;

    const equipmentItem = await Equipment.findById(equipmentId);
    if (!equipmentItem) {
      return res.status(404).json({ msg: 'Equipment not found' });
    }

    const newRequest = new Request({
      subject,
      description,
      equipment: equipmentId,
      team: equipmentItem.team,
      createdBy: req.user.id,
      type,
      priority,
      scheduledDate,
      stage: 'New'
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { type, technician } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (technician) filter.assignedTechnician = technician;

    const requests = await Request.find(filter)
      .populate('equipment', 'name serialNumber')
      .populate('team', 'name')
      .populate('assignedTechnician', 'name avatar')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const { stage } = req.body;
    
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (stage === 'Scrap') {
      await Equipment.findByIdAndUpdate(request.equipment, { 
        status: 'Scrapped' 
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;