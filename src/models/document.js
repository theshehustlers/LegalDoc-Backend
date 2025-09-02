import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  original_content: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    default: 'General',
  },
  confidence: {
    type: Number,
    default: 0.0,
  },
  explanation: {
    type: String,
    default: 'No explanation provided.',
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
