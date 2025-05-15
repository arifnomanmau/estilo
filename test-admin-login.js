/**
 * Admin Login Test Script
 * This script helps diagnose admin login issues by checking the stored credentials 
 * in the database and verifying password hashing.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { createHash } from 'crypto';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Admin Login Diagnostic Tool');
console.log('===========================\n');

// Check if the DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  // Try to load from .env file
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=(.+?)(\n|$)/);
      if (dbUrlMatch && dbUrlMatch[1]) {
        process.env.DATABASE_URL = dbUrlMatch[1];
        console.log('✅ Loaded DATABASE_URL from .env file');
      }
    }
  } catch (error) {
    console.error('❌ Error loading .env file:', error.message);
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('Please set it before running this script.');
  process.exit(1);
}

// Setup DB connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Simple password hashing function (for testing)
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

// Test admin login
async function testAdminLogin() {
  try {
    // Default admin credentials
    const username = 'admin';
    const password = 'admin123';
    const hashedPassword = hashPassword(password);
    
    console.log('Testing admin login with:');
    console.log(`- Username: ${username}`);
    console.log(`- Password: ${password} (plain)`);
    console.log(`- Hashed: ${hashedPassword.substring(0, 10)}...${hashedPassword.substring(hashedPassword.length - 10)}`);
    
    // Check if admin user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      console.log('\n❌ Admin user does not exist in the database.');
      console.log('Run the seed-admin.js script to create an admin user.');
      return;
    }
    
    const adminUser = result.rows[0];
    console.log('\n✅ Found admin user in database:');
    console.log(`- ID: ${adminUser.id}`);
    console.log(`- Username: ${adminUser.username}`);
    console.log(`- Is Admin: ${adminUser.is_admin}`);
    console.log(`- Password in DB: ${adminUser.password.substring(0, 10)}...${adminUser.password.substring(adminUser.password.length - 10)}`);
    
    // Check if password matches
    const plainTextMatch = password === adminUser.password;
    const hashMatch = hashedPassword === adminUser.password;
    
    console.log('\nPassword verification:');
    console.log(`- Plain text match: ${plainTextMatch ? '✅ Yes' : '❌ No'}`);
    console.log(`- Hash match: ${hashMatch ? '✅ Yes' : '❌ No'}`);
    
    if (!plainTextMatch && !hashMatch) {
      console.log('\n❌ Password doesn\'t match either in plain text or hashed form.');
      console.log('This might be why admin login is failing.');
      
      // Suggest a fix
      console.log('\nTo fix this issue, you can update the password in the database:');
      console.log('Option 1: Set to plain text password (for development only):');
      console.log(`  UPDATE users SET password = '${password}' WHERE username = '${username}';`);
      console.log('Option 2: Set to hashed password (recommended):');
      console.log(`  UPDATE users SET password = '${hashedPassword}' WHERE username = '${username}';`);
    } else {
      console.log('\n✅ Password verification successful! The issue is likely elsewhere.');
      console.log('Check the client-side login code or API route handling.');
    }
    
    // Check if is_admin is TRUE
    if (!adminUser.is_admin) {
      console.log('\n❌ The admin user does not have admin privileges (is_admin is false).');
      console.log('To fix this issue, run:');
      console.log(`  UPDATE users SET is_admin = TRUE WHERE username = '${username}';`);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminLogin();

// Script to test admin login and API connections
import https from 'https';
import crypto from 'crypto';

// Configuration
const config = {
  credentials: {
    username: 'admin',
    password: 'admin123'
  },
  api: {
    // Try both direct and nested auth endpoints
    directUrl: 'https://estilo-ashy.vercel.app/api/login',
    nestedUrl: 'https://estilo-ashy.vercel.app/api/auth/login'
  }
};

// Display configuration
console.log('🔍 Admin Login Test Configuration:');
console.log(`Username: ${config.credentials.username}`);
console.log(`Password: ${'*'.repeat(config.credentials.password.length)}`);
console.log(`Direct API Endpoint: ${config.api.directUrl}`);
console.log(`Nested API Endpoint: ${config.api.nestedUrl}`);
console.log('\n');

// Test hash generation (matching seed-admin.js)
const hashedPassword = crypto.createHash('sha256').update(config.credentials.password).digest('hex');
console.log('💡 Admin Password Hash Info:');
console.log(`SHA-256 Hash: ${hashedPassword}`);
console.log('\n');

// Helper function to make a POST request
function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode} ${res.statusMessage}`);
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          console.log('❌ Error parsing response:', error.message);
          console.log('Raw response:', responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawResponse: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test the direct endpoint
async function testDirectEndpoint() {
  console.log('🔑 Testing direct login endpoint:');
  try {
    const response = await makePostRequest(config.api.directUrl, config.credentials);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('\n');
    return response;
  } catch (error) {
    console.error('Error testing direct endpoint:', error.message);
    console.log('\n');
    return null;
  }
}

// Test the nested auth endpoint
async function testNestedEndpoint() {
  console.log('🔑 Testing nested auth login endpoint:');
  try {
    const response = await makePostRequest(config.api.nestedUrl, config.credentials);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('\n');
    return response;
  } catch (error) {
    console.error('Error testing nested endpoint:', error.message);
    console.log('\n');
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Admin Login API Tests\n');
  
  const directResult = await testDirectEndpoint();
  const nestedResult = await testNestedEndpoint();
  
  console.log('📋 Test Summary:');
  console.log(`Direct Endpoint (/api/login): ${directResult ? directResult.status === 200 ? '✅ SUCCESS' : '❌ FAILED' : '❌ ERROR'}`);
  console.log(`Nested Endpoint (/api/auth/login): ${nestedResult ? nestedResult.status === 200 ? '✅ SUCCESS' : '❌ FAILED' : '❌ ERROR'}`);
  
  if (directResult?.status === 200 || nestedResult?.status === 200) {
    console.log('\n✅ LOGIN TEST PASSED - At least one endpoint is working correctly');
    
    // Show which endpoint to use
    if (directResult?.status === 200) {
      console.log('👉 RECOMMENDATION: Use the direct endpoint (/api/login) in your config.ts');
    } else {
      console.log('👉 RECOMMENDATION: Use the nested endpoint (/api/auth/login) in your config.ts');
    }
  } else {
    console.log('\n❌ LOGIN TEST FAILED - Both endpoints returned errors');
  }
}

// Execute tests
runTests(); 