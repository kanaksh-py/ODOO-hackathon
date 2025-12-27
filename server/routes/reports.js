const express = require('express');
const router = express.Router();
const Request = require('../models/request');
const Equipment = require('../models/equipment');
const auth = require('../middleware/auth');

router.get('/kpi', auth, async (req, res) => {
  try {
    const activeCount = await Request.countDocuments({ 
      stage: { $nin: ['Repaired', 'Scrap'] } 
    });

    const scrappedCount = await Equipment.countDocuments({ status: 'Scrapped' });

    const hoursData = await Request.aggregate([
      { $match: { stage: 'Repaired' } },
      { $group: { _id: null, totalHours: { $sum: '$duration' } } }
    ]);

    const totalHours = hoursData.length > 0 ? hoursData[0].totalHours : 0;

    res.json({
      activeRequests: activeCount,
      scrappedEquipment: scrappedCount,
      totalMaintenanceHours: totalHours
    });
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
});

router.get('/by-department', auth, async (req, res) => {
  try {
    const data = await Request.aggregate([
      {
        $lookup: {
          from: 'equipments',
          localField: 'equipment',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      },
      { $unwind: '$equipmentDetails' },
      {
        $group: {
          _id: '$equipmentDetails.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(data); 
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/technician-performance', auth, async (req, res) => {
  try {
    const data = await Request.aggregate([
      { $match: { stage: 'Repaired' } },
      {
        $lookup: {
          from: 'technicians', 
          localField: 'assignedTechnician',
          foreignField: '_id',
          as: 'techDetails'
        }
      },
      { $unwind: '$techDetails' },
      {
        $group: {
          _id: '$techDetails.name',
          jobsCompleted: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { jobsCompleted: -1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
