// server/seed.js
require('dotenv').config(); // Load your .env variables
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import your Models
const Team = require('./models/team');
const Technician = require('./models/technician'); // This is your Universal User model
const Equipment = require('./models/equipment');
const Request = require('./models/request');

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 2. Clear existing data (Fresh Start)
    await Team.deleteMany({});
    await Technician.deleteMany({});
    await Equipment.deleteMany({});
    await Request.deleteMany({});
    console.log('🧹 Old data cleared');

    // 3. Create Teams
    const mechanicsTeam = await Team.create({ name: 'Mechanics', specialization: 'Mechanical' });
    const itTeam = await Team.create({ name: 'IT Support', specialization: 'IT' });
    const electricalTeam = await Team.create({ name: 'Electricians', specialization: 'Electrical' });

    // 4. Create Users (Technicians & Employees)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt); // Default password for everyone

    // --- Technicians ---
    const tech1 = await Technician.create({
      name: 'Tom Wilson',
      email: 'tom@test.com',
      password: hashedPassword,
      role: 'Technician',
      avatar: 'https://i.pravatar.cc/150?u=tom',
      specialization: ['CNC Machines', 'Heavy Machinery']
    });

    const tech2 = await Technician.create({
      name: 'Sarah Connor',
      email: 'sarah@test.com',
      password: hashedPassword,
      role: 'Technician',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      specialization: ['Forklifts', 'Vehicles']
    });

    // --- Employees (Managers/Owners) ---
    const emp1 = await Technician.create({
      name: 'John Doe',
      email: 'john@test.com',
      password: hashedPassword,
      role: 'Employee',
      avatar: 'https://i.pravatar.cc/150?u=john'
    });

    const emp2 = await Technician.create({
      name: 'Jane Smith',
      email: 'jane@test.com',
      password: hashedPassword,
      role: 'Employee',
      avatar: 'https://i.pravatar.cc/150?u=jane'
    });

    console.log('👥 Users & Teams created');

    // 5. Create Equipment
    const equipment1 = await Equipment.create({
      name: 'CNC Machine 001',
      serialNumber: 'CNC-2023-001',
      department: 'Production',
      assignedTo: emp1._id, // Assigned to John
      status: 'Operational',
      location: 'Factory Floor A',
      team: mechanicsTeam._id
    });

    const equipment2 = await Equipment.create({
      name: 'Dell XPS Laptop',
      serialNumber: 'LPT-2023-045',
      department: 'IT',
      assignedTo: emp2._id, // Assigned to Jane
      status: 'Operational',
      location: 'Office 3rd Floor',
      team: itTeam._id
    });

    const equipment3 = await Equipment.create({
      name: 'Toyota Forklift',
      serialNumber: 'FRK-2022-012',
      department: 'Warehouse',
      assignedTo: emp1._id, // Assigned to John
      status: 'Under Maintenance',
      location: 'Warehouse B',
      team: mechanicsTeam._id
    });

    console.log('🚜 Equipment created');

    // 6. Create Requests
    await Request.create({
      subject: 'Oil Leak Detected',
      description: 'Machine is leaking hydraulic fluid.',
      equipment: equipment1._id,
      team: mechanicsTeam._id, // Auto-assigned to Mechanics
      createdBy: emp1._id, // Reported by John
      type: 'Corrective',
      priority: 'High',
      stage: 'New',
      scheduledDate: new Date('2025-12-28')
    });

    await Request.create({
      subject: 'Routine Inspection',
      description: 'Monthly preventive check.',
      equipment: equipment3._id,
      team: mechanicsTeam._id,
      createdBy: emp1._id,
      assignedTechnician: tech2._id, // Assigned to Sarah
      type: 'Preventive',
      priority: 'Medium',
      stage: 'In Progress',
      scheduledDate: new Date('2025-12-29')
    });

    await Request.create({
      subject: 'Cracked Screen',
      description: 'Laptop screen needs replacement.',
      equipment: equipment2._id,
      team: itTeam._id,
      createdBy: emp2._id, // Reported by Jane
      assignedTechnician: tech1._id, // Assigned to Tom
      type: 'Corrective',
      priority: 'Low',
      stage: 'Repaired',
      scheduledDate: new Date('2025-12-20'),
      duration: 3
    });

    console.log('Requests created');
    console.log('Database Seeded Successfully!');
    process.exit(0);

  } catch (error) {
    console.error(' Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();