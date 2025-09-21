import express from 'express';
import { setupRoutes } from './routes/index.js';
import { connectToDatabase } from './db/mysql.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectToDatabase();

// Setup routes
setupRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});