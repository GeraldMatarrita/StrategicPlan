const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Card Analysis Model.
 * 
 * This model represents individual cards within an analysis, which consist of
 * a title and a description. These cards may be used in various assessments or
 * strategic frameworks in the application.
 */
const cardsAnalysisSchema = new mongoose.Schema({
  title: String, // Title of the analysis card
  description: String // Detailed description of the analysis card
});

/**
 * Function to validate card analysis data.
 * 
 * Ensures that the provided card analysis data follows the correct format before saving to the database.
 * Validates the length constraints and types for the title and description.
 *
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object containing any validation errors and the validated value.
 */
const validateCardAnalysis = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(4).max(200).optional().label("Title"),
    description: Joi.string().min(5).max(1000).optional().label("Description")
  });
  return schema.validate(data);
};

// Definition of the cardAnalysis model
const cardAnalysis = mongoose.model("cardAnalysis", cardsAnalysisSchema);

// Export the model and the validation function
module.exports = { cardAnalysis, validateCardAnalysis };
