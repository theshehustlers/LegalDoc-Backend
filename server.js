import express from 'express';
import documentRoutes from './src/routes/document.routes.js';
import connectDB from './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle JSON request bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Main entry point for our API
app.get('/', (req, res) => {
  res.send('Legal Document Analyzer API is running!');
});

// Use the document routes for any request to /api/documents
app.use('/api/documents', documentRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
