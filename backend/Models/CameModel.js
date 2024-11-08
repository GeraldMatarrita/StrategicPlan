const mongoose = require("mongoose");

/**
 * CAME Model.
 * 
 * This model represents the CAME analysis, which categorizes different actions
 * related to strategic planning. Each category is associated with a list of `cardAnalysis`
 * references.
 */
const cameSchema = new mongoose.Schema({
  correct: [{ // List of cardAnalysis IDs for the "Correct" category
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'cardAnalysis' 
  }],
  afront: [{ // List of cardAnalysis IDs for the "Afront" (Confront) category
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'cardAnalysis' 
  }],
  maintain: [{ // List of cardAnalysis IDs for the "Maintain" category
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'cardAnalysis' 
  }],
  explore: [{ // List of cardAnalysis IDs for the "Explore" category
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'cardAnalysis' 
  }],
}, { strict: "throw" });

/**
 * Definition of the CAME model.
 */
const CAME = mongoose.model('CAME', cameSchema);

// Exporting the CAME model
module.exports = CAME;
