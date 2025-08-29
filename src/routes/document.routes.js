import express from 'express';
import multer from 'multer';
import { analyzeDocument } from '../controller/document.controller.js';

const router = express.Router();

// Configure Multer to store files in memory as buffers.
// This is efficient because we don't need to save the file to disk,
// we just process it and then save its data to the database.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the route for document upload.
// POST /api/documents/upload
// The `upload.single('document')` part tells Multer to expect one file,
// and that it will be in a form field named 'document'.
router.post('/upload', upload.single('document'), analyzeDocument);

export default router;