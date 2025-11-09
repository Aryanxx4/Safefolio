"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = require("./pool");
const fs_1 = require("fs");
const path_1 = require("path");
async function initData() {
    try {
        const sql = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'init_data.sql'), 'utf8');
        await pool_1.pool.query(sql);
        console.log('Successfully initialized test data');
    }
    catch (err) {
        console.error('Error initializing test data:', err);
    }
    finally {
        await pool_1.pool.end();
    }
}
initData();
