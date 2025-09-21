import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'sql311.infinityfree.com',
  user: 'if0_39991591',
  password: 'Bharathi1087',
  database: 'if0_39991591_feelbetterai',
  port: 3306,
});
