// import path from 'path';
// import { spawn } from 'child_process';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
// import mammoth from 'mammoth';
// import PDFDocument from 'pdfkit';
// import Document from '../models/document.js';

// // Defines the path to the PDF.js font files
// const pdfjsFontPath = path.resolve(process.cwd(), 'node_modules', 'pdfjs-dist', 'standard_fonts').replace(/\\/g, '/') + '/';

// /**
//  * Extracts text from various document types (PDF, DOCX, etc.).
//  */
// const extractText = async (buffer, mimetype) => {
//   if (mimetype === 'application/pdf') {
//     const uint8Array = new Uint8Array(buffer);
//     const pdfDoc = await pdfjsLib.getDocument({ 
//       data: uint8Array,
//       standardFontDataUrl: pdfjsFontPath,
//     }).promise;
//     let fullText = '';
//     for (let i = 1; i <= pdfDoc.numPages; i++) {
//       const page = await pdfDoc.getPage(i);
//       const textContent = await page.getTextContent();
//       const pageText = textContent.items.map(item => item.str).join(' ');
//       fullText += pageText + '\n';
//     }
//     return fullText;
//   } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//     const { value } = await mammoth.extractRawText({ buffer });
//     return value;
//   } else {
//     return buffer.toString('utf8');
//   }
// };

// /**
//  * Extracts a list of unique, meaningful keywords and phrases from the document's text.
//  */
// const extractKeywords = (text) => {
//   const lowerCaseText = text.toLowerCase();
  
//   // A list of important legal phrases to look for.
//   const keyPhrases = [
//     'contract', 'agreement', 'party', 'parties', 'plaintiff', 'defendant', 'termination', 'clause',
//     'lease', 'landlord', 'tenant', 'property', 'deed', 'premises',
//     'last will and testament', 'will', 'testament', 'bequeath', 'estate', 'executor',
//     'employment', 'employee', 'employer', 'salary', 'position',
//     'corporate', 'business', 'company', 'shares', 'bylaws', 'meeting', 'minutes',
//     'intellectual property', 'patent', 'trademark', 'copyright',
//     'litigation', 'lawsuit', 'court',
//     'family law', 'divorce', 'custody', 'marriage',
//     'criminal', 'offense', 'prosecution', 'charge', 'sentence',
//     'tax', 'revenue', 'deduction',
//     'insurance', 'policy', 'claim',
//     'loan', 'credit', 'mortgage', 'finance', 'bank', 'account', 'payment',
//     'resume', 'curriculum vitae', 'education', 'experience', 'skills', 'qualifications'
//   ];

//   const foundKeywords = new Set();

//   keyPhrases.forEach(phrase => {
//     // Check if the text includes the phrase (with spaces)
//     if (lowerCaseText.includes(phrase.replace(/_/g, ' '))) {
//       // Add the Prolog-friendly version (with underscores) to our set
//       foundKeywords.add(phrase.replace(/\s+/g, '_'));
//     }
//   });

//   // Also add some general long words as a fallback.
//   const words = lowerCaseText.match(/\b(\w{6,})\b/g) || [];
//   words.slice(0, 10).forEach(word => foundKeywords.add(word));

//   return [...foundKeywords];
// };


// /**
//  * Communicates with the upgraded Prolog engine to get category, confidence, and explanation.
//  */
// const getCategoryFromProlog = (keywords) => {
//   return new Promise((resolve, reject) => {
//     const keywordList = `['${keywords.join("','")}']`;
//     // The query now calls the 4-argument `categorize` predicate. `once/1` ensures it stops after the first match.
//     const prologQuery = `once(categorize(${keywordList}, Category, Confidence, Explanation)), format('~w|~f|~w', [Category, Confidence, Explanation]), halt.`;
    
//     const prologDir = path.resolve('src/engine');
//     const prologProcess = spawn('swipl', ['-q', '-s', 'rules.pl'], { cwd: prologDir });
//     let output = '';
//     let errorOutput = '';
//     prologProcess.stdout.on('data', (data) => { output += data.toString(); });
//     prologProcess.stderr.on('data', (data) => { errorOutput += data.toString(); });
//     prologProcess.on('close', () => {
//       if (errorOutput) {
//         console.error(`Prolog execution error: ${errorOutput}`);
//         return reject('Could not analyze document category.');
//       }
      
//       const parts = output.trim().split('|');
//       // If Prolog fails to find a match and our default rule doesn't run, we provide a safe fallback here.
//       if (parts.length < 3) {
//          console.error('Unexpected Prolog output, applying default:', output);
//          return resolve({ category: 'General-Legal-Document', confidence: 0.3, explanation: 'Default rule applied due to parsing error.' });
//       }
//       const [category, confidence, explanation] = parts;
      
//       resolve({ 
//         category: category || 'General', 
//         confidence: parseFloat(confidence) || 0.0, 
//         explanation: explanation || 'No specific rules matched.' 
//       });
//     });
//     prologProcess.stdin.write(prologQuery);
//     prologProcess.stdin.end();
//   });
// };

// /**
//  * Handles the document upload, analysis, and saving to the database.
//  */
// export const analyzeDocument = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No document file uploaded.' });
//     }
//     const textContent = await extractText(req.file.buffer, req.file.mimetype);
//     const keywords = extractKeywords(textContent);
    
//     if (keywords.length === 0) {
//         return res.status(400).json({ message: 'Could not extract any keywords from the document.' });
//     }
    
//     const analysisResult = await getCategoryFromProlog(keywords);

//     const newDocument = new Document({
//         filename: req.file.originalname,
//         original_content: textContent,
//         keywords: keywords,
//         category: analysisResult.category,
//         confidence: analysisResult.confidence,
//         explanation: analysisResult.explanation,
//         fileSize: req.file.size, // File size is correctly saved.
//     });
    
//     await newDocument.save();

//     res.status(200).json({
//       message: 'Document analyzed and saved successfully!',
//       document: newDocument,
//     });

//   } catch (error) {
//     console.error('Error in analyzeDocument controller:', error);
//     res.status(500).json({ message: 'Server error during document analysis.' });
//   }
// };

import path from 'path';
import { spawn } from 'child_process';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';
import Document from '../models/document.js';

const pdfjsFontPath =
  path.resolve(process.cwd(), 'node_modules', 'pdfjs-dist', 'standard_fonts')
    .replace(/\\/g, '/') + '/';

// --- TEXT EXTRACTION ---
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
  }
  return buffer.toString('utf8');
};

// --- KEYWORD EXTRACTION (for Prolog rules) ---
const extractKeywords = (text) => {
  const lower = (text || '').toLowerCase();
  const keyPhrases = [
    'contract','agreement','party','parties','plaintiff','defendant','termination','clause',
    'lease','landlord','tenant','property','deed','premises',
    'last will and testament','will','testament','bequeath','estate','executor',
    'employment','employee','employer','salary','position',
    'corporate','business','company','shares','bylaws','meeting','minutes',
    'intellectual property','patent','trademark','copyright',
    'litigation','lawsuit','court',
    'family law','divorce','custody','marriage',
    'criminal','offense','prosecution','charge','sentence',
    'tax','revenue','deduction',
    'insurance','policy','claim',
    'loan','credit','mortgage','finance','bank','account','payment',
    'resume','curriculum vitae','education','experience','skills','qualifications',
    'research','methodology','data collection','questionnaire','interview','observation',
    'system design','architecture','testing','validation','overview','flowchart','dfd','report'
  ];
  const found = new Set();
  keyPhrases.forEach(p => {
    if (lower.includes(p)) found.add(p.replace(/\s+/g, '_'));
  });
  (lower.match(/\b(\w{6,})\b/g) || []).slice(0, 10).forEach(w => found.add(w));
  return [...found];
};

// --- JS CATEGORIZER (fallback) ---
function categorizeWithJS(text) {
  const content = (text || '').toLowerCase();
  const categoryKeywords = {
    'Contract/Agreement': [
      'agreement','contract','party','parties','terms','conditions','clause','breach','performance','obligation','covenant','consideration','execute','binding','enforce','remedy','termination'
    ],
    'Property/Real Estate': [
      'property','real estate','land','premises','deed','mortgage','title','lease','landlord','tenant','rent','purchase','sale','conveyance','easement','zoning','closing'
    ],
    'Estate Planning/Will': [
      'last will and testament','will','testament','estate','beneficiary','heir','inherit','probate','executor','trust','guardian','bequest','legacy','succession','fiduciary','testator','decedent'
    ],
    'Employment Law': [
      'employment','employee','employer','work','job','salary','wages','benefits','termination','resignation','discrimination','harassment','wrongful','labor','union','collective'
    ],
    'Corporate/Business': [
      'corporation','corporate','company','business','board','directors','shareholders','stock','shares','merger','acquisition','governance','bylaws','articles','llc'
    ],
    'Intellectual Property': [
      'patent','trademark','copyright','intellectual property','infringement','license','royalty','invention','brand','trade secret','dmca','fair use','derivative'
    ],
    'Litigation/Court': [
      'court','litigation','lawsuit','plaintiff','defendant','judgment','verdict','trial','motion','discovery','deposition','subpoena','appeal','damages','injunction'
    ],
    'Family Law': [
      'divorce','custody','child support','alimony','marriage','spouse','family','adoption','domestic','visitation','separation','prenuptial','guardian','minor'
    ],
    'Criminal Law': [
      'criminal','crime','felony','misdemeanor','arrest','prosecution','defense','guilty','innocent','sentence','bail','probation','parole','conviction','appeal','offense','charge'
    ],
    'Tax Law': [
      'tax','taxes','irs','income','deduction','exemption','audit','refund','penalty','interest','revenue','filing','return','assessment','collection'
    ],
    'Insurance': [
      'insurance','policy','premium','claim','coverage','deductible','beneficiary','insurer','insured','liability','casualty','life insurance','health insurance'
    ],
    'Banking/Finance': [
      'bank','loan','credit','debt','finance','mortgage','interest','principal','collateral','default','foreclosure','bankruptcy','securities','investment','financial','account','payment'
    ],
    'Research/Brief': [
      'research','methodology','chapter','data collection','questionnaire','interview','observation','system design','system architecture','testing','validation','overview','flowchart','dfd','report'
    ],
    'Resume/CV': [
      'resume','curriculum vitae','cv','education','experience','skills','qualifications','profile','objective','references','work history'
    ],
  };

  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let best = { cat: 'General Legal Document', score: 0, matches: [] };
  let second = 0;

  for (const [cat, terms] of Object.entries(categoryKeywords)) {
    let score = 0; const hit = [];
    for (const t of terms) {
      const re = new RegExp(`\\b${escapeRe(t)}\\b`, 'gi');
      const n = (content.match(re) || []).length;
      if (n) { score += n * (t.includes(' ') ? 2 : 1); hit.push(`${t}(${n})`); }
    }
    if (score > best.score) { second = best.score; best = { cat, score, matches: hit }; }
    else if (score > second) { second = score; }
  }

  if (!best.score) {
    return { category: 'General Legal Document', confidence: 0.3, explanation: 'No strong category keywords found.' };
  }
  const conf = Math.min(0.95, best.score / (best.score + second + 5));
  return {
    category: best.cat,
    confidence: parseFloat(conf.toFixed(2)),
    explanation: best.matches.length ? `Matched: ${best.matches.slice(0, 5).join(', ')}` : `Highest score: ${best.cat}`
  };
}

// --- PROLOG AVAILABILITY CHECK ---
let _swiplChecked = false;
let _swiplAvailable = false;

function isSwiplAvailable(timeoutMs = 1500) {
  if (_swiplChecked) return Promise.resolve(_swiplAvailable);
  return new Promise((resolve) => {
    const p = spawn('swipl', ['--version']);
    const timer = setTimeout(() => {
      try { p.kill(); } catch {}
      _swiplChecked = true; _swiplAvailable = false; resolve(false);
    }, timeoutMs);
    p.on('error', () => { clearTimeout(timer); _swiplChecked = true; _swiplAvailable = false; resolve(false); });
    p.on('exit', (code) => { clearTimeout(timer); _swiplChecked = true; _swiplAvailable = code === 0; resolve(_swiplAvailable); });
  });
}

// --- PROLOG CATEGORIZER ---
const getCategoryFromProlog = (keywords) => {
  return new Promise((resolve, reject) => {
    const keywordList = `['${keywords.join("','")}']`;
    const prologQuery =
      `once(categorize(${keywordList}, Category, Confidence, Explanation)),` +
      ` format('~w|~f|~w', [Category, Confidence, Explanation]), halt.`;

    const prologDir = path.resolve('src/engine');
    const pr = spawn('swipl', ['-q', '-s', 'rules.pl'], { cwd: prologDir });

    let out = '', err = '';
    pr.stdout.on('data', (d) => { out += d.toString(); });
    pr.stderr.on('data', (d) => { err += d.toString(); });
    pr.on('error', (e) => reject(e));
    pr.on('close', () => {
      if (err) return reject(new Error(err));
      const parts = out.trim().split('|');
      if (parts.length < 3) {
        return resolve({ category: 'General Legal Document', confidence: 0.3, explanation: 'Default: no Prolog match.' });
      }
      const [category, confidence, explanation] = parts;
      resolve({
        category: category || 'General Legal Document',
        confidence: parseFloat(confidence) || 0.3,
        explanation: explanation || 'No specific rules matched.'
      });
    });

    pr.stdin.write(prologQuery);
    pr.stdin.end();
  });
};

// --- MAIN CONTROLLER ---
export const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No document file uploaded.' });

    const textContent = await extractText(req.file.buffer, req.file.mimetype);
    const keywords = extractKeywords(textContent);

    let analysisResult;
    try {
      if (await isSwiplAvailable() && process.env.USE_PROLOG !== 'false') {
        analysisResult = await getCategoryFromProlog(keywords);
      } else {
        analysisResult = categorizeWithJS(textContent);
        analysisResult.explanation = `JS fallback — ${analysisResult.explanation}`;
      }
    } catch (e) {
      // Any Prolog crash → safe fallback
      analysisResult = categorizeWithJS(textContent);
      analysisResult.explanation = `JS fallback (Prolog error) — ${analysisResult.explanation}`;
    }

    const newDocument = new Document({
      filename: req.file.originalname,
      original_content: textContent,
      keywords,
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
    console.error('Error in analyzeDocument:', error);
    res.status(500).json({ message: 'Server error during document analysis.' });
  }
};


/**
 * Fetches all document reports with the necessary fields for the UI.
 */
export const getAllDocuments = async (req, res) => {
  try {
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

/**
 * Deletes all documents analysis.
 */
export const deleteAllDocuments = async (req, res) => {
  try {
    const result = await Document.deleteMany({});
    res.status(200).json({ 
      message: 'All document analyses have been successfully deleted.',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing all documents:', error);
    res.status(500).json({ message: 'Server error while clearing document history.' });
  }
};