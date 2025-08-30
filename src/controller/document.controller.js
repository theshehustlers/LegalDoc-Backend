import path from 'path';
import { spawn } from 'child_process';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import Document from '../models/document.js';

// Defines the path to the PDF.js font files, fixing potential rendering issues on the server.
const pdfjsFontPath = path.resolve(process.cwd(), 'node_modules', 'pdfjs-dist', 'standard_fonts').replace(/\\/g, '/') + '/';

/**
 * Extracts text from various document types (PDF, DOCX, etc.).
 */
const extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    const uint8Array = new Uint8Array(buffer);
    const pdfDoc = await pdfjsLib.getDocument({ 
      data: uint8Array,
      standardFontDataUrl: pdfjsFontPath,
    }).promise;
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } else {
    return buffer.toString('utf8');
  }
};

/**
 * Extracts a list of unique, meaningful keywords from the document's text.
 */
const extractKeywords = (text) => {
  const stopWords = new Set(['and', 'the', 'is', 'in', 'it', 'of', 'a', 'for', 'to', 'on', 'with', 'as', 'by', 'at']);
  const words = text.toLowerCase().match(/\b(\w{4,})\b/g) || []; // Get words of 4+ length
  return [...new Set(words.filter(word => !stopWords.has(word)))].slice(0, 20);
};

/**
 * Communicates with the upgraded Prolog engine to get category, confidence, and explanation.
 */
const getCategoryFromProlog = (keywords) => {
  return new Promise((resolve, reject) => {
    const keywordList = `['${keywords.join("','")}']`;
    // `once/1` ensures Prolog stops after the first successful rule match.
    const prologQuery = `once(categorize(${keywordList}, Category, Confidence, Explanation)), format('~w|~f|~w', [Category, Confidence, Explanation]), halt.`;
    
    const prologDir = path.resolve('src/engine');
    const prologProcess = spawn('swipl', ['-q', '-s', 'rules.pl'], { cwd: prologDir });
    let output = '';
    let errorOutput = '';
    prologProcess.stdout.on('data', (data) => { output += data.toString(); });
    prologProcess.stderr.on('data', (data) => { errorOutput += data.toString(); });
    prologProcess.on('close', (code) => {
      if (errorOutput) {
        console.error(`Prolog execution error: ${errorOutput}`);
        return reject('Could not analyze document category.');
      }
      
      const parts = output.trim().split('|');
      if (parts.length < 3) {
         console.error('Unexpected Prolog output:', output);
         return reject('Could not parse Prolog analysis results.');
      }
      const [category, confidence, explanation] = parts;
      
      resolve({ 
        category: category || 'General', 
        confidence: parseFloat(confidence) || 0.3, 
        explanation: explanation || 'No explanation provided.' 
      });
    });
    prologProcess.stdin.write(prologQuery);
    prologProcess.stdin.end();
  });
};

/**
 * Handles the document upload, analysis, and saving to the database.
 */
export const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document file uploaded.' });
    }
    const textContent = await extractText(req.file.buffer, req.file.mimetype);
    const keywords = extractKeywords(textContent);
    if (keywords.length === 0) {
        return res.status(400).json({ message: 'Could not extract any keywords from the document.' });
    }
    
    const analysisResult = await getCategoryFromProlog(keywords);

    const newDocument = new Document({
        filename: req.file.originalname,
        original_content: textContent,
        keywords: keywords,
        category: analysisResult.category,
        confidence: analysisResult.confidence,
        explanation: analysisResult.explanation,
        fileSize: req.file.size,
    });
    
    await newDocument.save();

    res.status(200).json({
      message: 'Document analyzed and saved successfully!',
      document: newDocument,
    });

  } catch (error) {
    console.error('Error in analyzeDocument controller:', error);
    res.status(500).json({ message: 'Server error during document analysis.' });
  }
};

/**
 * Fetches all document reports with the necessary fields for the UI.
 */
export const getAllDocuments = async (req, res) => {
  try {
    // Now, every document in the list will have its unique ID.
    const documents = await Document.find().sort({ uploadedAt: -1 }).select('_id filename category confidence uploadedAt fileSize');
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error getting all documents:', error);
    res.status(500).json({ message: 'Server error while fetching documents.' });
  }
};

/**
 * Fetches a single, complete document analysis by its ID.
 */
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json(document);
  } catch (error) {
    console.error('Error getting document by ID:', error);
    res.status(500).json({ message: 'Server error while fetching document.' });
  }
};

/**
 * Deletes a document analysis by its ID.
 */
export const deleteDocumentById = async (req, res) => {
    try {
        const document = await Document.findByIdAndDelete(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }
        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Error deleting document by ID:', error);
        res.status(500).json({ message: 'Server error while deleting document.' });
    }
};
