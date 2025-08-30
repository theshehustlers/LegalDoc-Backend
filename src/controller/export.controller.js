import PDFDocument from 'pdfkit';
import Document from '../models/document.js';


/**
 * Generates and sends a PDF analysis report for a given document ID.
 */
export const exportDocumentAsPDF = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename.replace(/\.[^/.]+$/, "")}-analysis.pdf"`);
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('Legal Document Analysis Report', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).font('Helvetica-Bold').text('Document Details');
    doc.fontSize(12).font('Helvetica').text(`Original Filename: ${document.filename}`);
    doc.text(`Analyzed On: ${new Date(document.uploadedAt).toLocaleString()}`);
    if(document.fileSize) {
        doc.text(`File Size: ${(document.fileSize / 1024).toFixed(2)} KB`);
    }
    doc.moveDown();

    doc.fontSize(16).font('Helvetica-Bold').text('Analysis Results');
    doc.fontSize(12).font('Helvetica-Bold').text('Detected Category: ').font('Helvetica').text(document.category);
    if (document.confidence) {
        doc.fontSize(12).font('Helvetica-Bold').text('Confidence Score: ').font('Helvetica').text(`${Math.round(document.confidence * 100)}%`);
    }
     if (document.explanation) {
        doc.fontSize(12).font('Helvetica-Bold').text('Reasoning: ').font('Helvetica').text(document.explanation);
    }
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Extracted Keywords');
    doc.fontSize(10).font('Helvetica').list(document.keywords || [], { bulletRadius: 2 });
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Content Snippet');
    doc.fontSize(10).font('Helvetica').text((document.original_content || '').substring(0, 1500) + '...', {
      align: 'justify'
    });
    
    doc.end();

  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ message: 'Server error during PDF export.' });
  }
};