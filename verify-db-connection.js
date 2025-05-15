// Script to verify database connection in api/index.js
import { db } from './server/db.ts';
import { users } from './lib/schema';
import { eq } from 'drizzle-orm';

async function verifyDatabaseConnection() {
  console.log('🔍 Database Connection Verification');
  console.log('===================================');
  
  try {
    console.log('Testing database connection...');
    
    // Test a simple query to see if we can connect
    const allUsers = await db.select().from(users);
    console.log(`✅ Successfully connected to database, found ${allUsers.length} user(s)`);
    
    // Check if admin user exists
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (adminUser.length > 0) {
      console.log('✅ Admin user exists:');
      const admin = adminUser[0];
      console.log(`- ID: ${admin.id}`);
      console.log(`- Username: ${admin.username}`);
      console.log(`- Is Admin: ${admin.isAdmin}`);
      console.log(`- Password: ${admin.password.substring(0, 10)}...${admin.password.substring(admin.password.length - 10)}`);
    } else {
      console.log('❌ Admin user not found in the database!');
    }
    
    return {
      success: true,
      users: allUsers
    };
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the verification
verifyDatabaseConnection()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Database verification completed successfully.');
    } else {
      console.log('\n❌ Database verification failed.');
    }
  })
  .catch(error => {
    console.error('❌ Unhandled error during verification:', error);
  }); 