import { pool } from './pool';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initData() {
  try {
    const sql = readFileSync(join(__dirname, 'init_data.sql'), 'utf8');
    await pool.query(sql);
    console.log('Successfully initialized test data');
  } catch (err) {
    console.error('Error initializing test data:', err);
  } finally {
    await pool.end();
  }
}

initData();