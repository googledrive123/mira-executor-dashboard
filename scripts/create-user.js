// scripts/create-user.js
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { sql } = require('@vercel/postgres');

async function createUser() {
  // Generate a random 52-character key
  const loginKey = require('crypto').randomBytes(26).toString('hex'); // 52 hex chars
  
  console.log('Generated 52-digit login key:', loginKey);
  console.log('SAVE THIS KEY! You will need it to log in.');
  
  // Hash it
  const hash = await bcrypt.hash(loginKey, 10);
  
  // Insert into database
  await sql`
    INSERT INTO users (login_key_hash)
    VALUES (${hash})
  `;
  
  console.log('User created successfully!');
  process.exit(0);
}

createUser().catch((err) => {
  console.error('Error creating user:', err);
  process.exit(1);
});