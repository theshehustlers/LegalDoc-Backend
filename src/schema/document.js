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
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'General Legal Document',
  },
  summary: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  // We can link this to a user later
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
