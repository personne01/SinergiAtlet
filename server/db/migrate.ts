import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function migrate() {
  console.log('Running PostgreSQL migrations...\n');
  const client = await pool.connect();
  try {
    const migrationsDir = path.resolve(process.cwd(), 'server', 'db', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      console.log(`Executing migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Run the SQL script
      await client.query(sql);
      console.log(`  ✓ Successfully executed ${file}`);
    }
    
    console.log('\n✅ All PostgreSQL migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
