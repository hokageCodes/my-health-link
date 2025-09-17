// scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }
  const pw = process.env.ADMIN_PASSWORD || 'supersecurepassword';
  const admin = await User.create({
    name: 'Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    passwordHash: User.hashPassword(pw),
    role: 'admin',
    isVerified: true,
  });
  console.log('Admin created:', admin.email);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
