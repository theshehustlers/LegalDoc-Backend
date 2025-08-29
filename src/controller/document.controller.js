import path from 'path';
import { spawn } from 'child_process';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import Document from '../schema/document.js';

/**
 * Extracts text from a buffer based on its file type using pdfjs-dist for PDFs.
 * @param {Buffer} buffer - The file content as a buffer.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {Promise<string>} The extracted text content.
 */
const extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    const uint8Array = new Uint8Array(buffer);
    const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
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
 * Extracts simple keywords from text content.
 */
const extractKeywords = (text) => {
  const stopWords = new Set(['and', 'the', 'is', 'in', 'it', 'of', 'a', 'for', 'to']);
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  const uniqueKeywords = [...new Set(words.filter(word => !stopWords.has(word) && word.length > 3))];
  return uniqueKeywords.slice(0, 20);
};

/**
 * Calls the Prolog engine to categorize the document based on keywords using stdin.
 */
const getCategoryFromProlog = (keywords) => {
  return new Promise((resolve, reject) => {
    const keywordList = `['${keywords.join("','")}']`;
    // The query is now simpler, as we will load the file separately.
    const prologQuery = `categorize(${keywordList}, Category), write(Category), halt.`;
    
    const prologDir = path.resolve('src/engine');
    
    const prologProcess = spawn('swipl', ['-q', '-s', 'rules.pl'], { cwd: prologDir });

    let output = '';
    let errorOutput = '';

    // Listen for data coming from Prolog's output
    prologProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Listen for any errors
    prologProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // When the process closes, we check the results
    prologProcess.on('close', (code) => {
      if (errorOutput) {
        console.error(`Prolog execution error: ${errorOutput}`);
        return reject('Could not analyze document category.');
      }
      resolve(output.trim());
    });

    // Write our query to the Prolog process's standard input
    prologProcess.stdin.write(prologQuery);
    prologProcess.stdin.end();
  });
};


/**
 * Main controller function to handle document upload and analysis.
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

    const category = await getCategoryFromProlog(keywords);

    const newDocument = new Document({
        filename: req.file.originalname,
        original_content: textContent,
        keywords: keywords,
        category: category,
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