import express from 'express';
import multer from 'multer';

// --- CRITICAL CHECK ---
// Please ensure the filename in your /controller folder is exactly 'documentController.js'
// to match this import statement. A mismatch (e.g., 'document.controller.js')
// can cause the router to fail.
import { 
    analyzeDocument, 
    getAllDocuments, 
    getDocumentById, 
    deleteDocumentById 
} from '../controller/document.controller.js';

const router = express.Router();

// Configure Multer to store files in memory as buffers.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Route Definitions ---

// POST /api/documents/upload
// Handles the file upload and analysis.
router.post('/upload', upload.single('document'), analyzeDocument);

// GET /api/documents
// Retrieves a list of all analyzed documents.
router.get('/', getAllDocuments);

// GET /api/documents/:id
// Retrieves a single document by its unique ID.
router.get('/:id', getDocumentById);

// DELETE /api/documents/:id
// Deletes a single document by its unique ID.
router.delete('/:id', deleteDocumentById);

export default router;