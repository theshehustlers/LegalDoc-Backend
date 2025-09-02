import mongoose from "mongoose";

const UserPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: "User", // If you have authentication
    required: false
  },
  defaultConfidenceThreshold: {
    type: Number,
    default: 0.6,
  },
  exportFormat: {
    type: String,
    enum: ["pdf", "txt", "json"],
    default: "pdf",
  },
  autoExport: {
    type: Boolean,
    default: false,
  },
  includeCompliance: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.model("UserPreferences", UserPreferencesSchema);