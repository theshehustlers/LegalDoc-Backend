import express from "express";
import UserPreferences from "../models/UserPreferences.js";

const router = express.Router();

// Fetch user preferences
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const prefs = await UserPreferences.findOne({ userId });

    if (!prefs) {
      // Create defaults if not existing
      const newPrefs = await UserPreferences.create({ userId });
      return res.status(200).json(newPrefs);
    }

    res.status(200).json(prefs);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
});

// Update preferences
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { defaultConfidenceThreshold, exportFormat, autoExport, includeCompliance } = req.body;

    const updatedPrefs = await UserPreferences.findOneAndUpdate(
      { userId },
      {
        defaultConfidenceThreshold,
        exportFormat,
        autoExport,
        includeCompliance,
      },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedPrefs);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

export default router;