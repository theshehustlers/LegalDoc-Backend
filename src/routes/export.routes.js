import express from 'express';
import { exportDocumentAsPDF } from '../controller/export.controller.js';

const router = express.Router();

// GET /api/export/:id
// Exports the analysis of a document as a PDF file.
router.get('/:id', exportDocumentAsPDF);
export default router;