import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'your_host', // Replace with your Infinity Free host
  user: 'your_username', // Replace with your Infinity Free database username
  password: 'your_password', // Replace with your Infinity Free database password
  database: 'your_database_name', // Replace with your Infinity Free database name
};

export const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connection established');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};