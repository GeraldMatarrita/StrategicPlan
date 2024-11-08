const mongoose = require("mongoose");

/**
 * SWOT Model.
 * 
 * This model represents the SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis,
 * which is commonly used in strategic planning. Each category (strengths, weaknesses, 
 * opportunities, threats) is associated with a list of references to `cardAnalysis` documents.
 * The model is designed to store these references for each category, allowing for detailed
 * analysis of each aspect of the SWOT framework.
 */
const swotSchema = new mongoose.Schema(
  {
    strengths: [
      { type: mongoose.Schema.Types.ObjectId, ref: "cardAnalysis" } // References to the cardAnalysis model for strengths
    ],
    weaknesses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "cardAnalysis" } // References to the cardAnalysis model for weaknesses
    ],
    opportunities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "cardAnalysis" } // References to the cardAnalysis model for opportunities
    ],
    threats: [
      { type: mongoose.Schema.Types.ObjectId, ref: "cardAnalysis" } // References to the cardAnalysis model for threats
    ],
  },
  { strict: "throw" } // Throws an error if an unknown field is provided
);

// Definition of the SWOT model.
const SWOT = mongoose.model("SWOT", swotSchema);

// Exporting the SWOT model
module.exports = SWOT;

