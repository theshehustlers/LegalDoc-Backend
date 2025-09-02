import Document from '../models/document.js';
import PDFDocument from 'pdfkit';
/**
 * Generates and sends a PDF analysis report for a given document ID.
 */
export const exportDocumentAsPDF = async (req, res) => {
  try {
    const d = await Document.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Document not found.' });

    const safeName = (d.filename || 'report').replace(/\.[^/.]+$/, '');
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}-analysis.pdf"`);
    res.setHeader('Cache-Control', 'no-store');

    const doc = new PDFDocument({ margin: 50 });

    doc.on('error', (err) => {
      console.error('PDFKit error:', err);
      try { res.end(); } catch {}
    });
    res.on('close', () => { try { doc.destroy(); } catch {} });

    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('Legal Document Analysis Report', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).font('Helvetica-Bold').text('Document Overview');
    doc.fontSize(12).font('Helvetica').text(`Filename: ${d.filename}`);
    if (d.fileSize) doc.text(`File Size: ${(d.fileSize / 1024).toFixed(2)} KB`);
    doc.text(`Analyzed On: ${new Date(d.uploadedAt).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('AI Analysis');
    doc.fontSize(12).font('Helvetica').text(`Detected Category: ${d.category}`);
    if (typeof d.confidence === 'number') doc.text(`Confidence Score: ${Math.round(d.confidence * 100)}%`);
    if (d.explanation) doc.text(`Reasoning: ${d.explanation}`);
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Extracted Keywords');
    doc.fontSize(10).font('Helvetica').list(d.keywords || [], { bulletRadius: 2 });
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Content Snippet');
    doc.fontSize(10).font('Helvetica').text(((d.original_content || '') + '').slice(0, 1500) + (d.original_content?.length > 1500 ? '…' : ''), { align: 'justify' });

    doc.end(); // never call res.end() yourself
  } catch (error) {
    console.error('Error exporting PDF:', error);
    if (!res.headersSent) return res.status(500).json({ message: 'Server error during PDF export.' });
    try { res.end(); } catch {}
  }
};