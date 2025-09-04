import express from 'express';
import documentRoutes from './src/routes/document.routes.js'
import exportRoutes from './src/routes/export.routes.js'
import preferencesRoutes from './src/routes/preferences.routes.js'
import { ConnectDb } from './src/config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';

// Initial Setup
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5006;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://68af8ed891f0344fdfb4c455--legaldocc.netlify.app',
  ''
];
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Middleware Setup (ORDER IS CRITICAL)
// The CORS middleware MUST be the very first middleware loaded.
app.use(cors(corsOptions));

// Now, other middleware like the JSON parser can be loaded.
app.use(express.json());

// Database Connection
ConnectDb();

// API Routes
app.get('/', (req, res) => {
  res.send('Legal Document Analyzer API is running!');
});

// All document-related routes
app.use('/api/documents', documentRoutes);

// export-related routes
app.use('/api/export', exportRoutes);

// User preferences routes
app.use("/api/preferences", preferencesRoutes);

// Start the Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
