const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Indicator Model.
 * 
 * This model represents an indicator that tracks specific metrics related to operational plans and activities.
 * It includes a description, actual value, total value, type of indicator (numeral, binary, or percentage), 
 * and references to the related operational plan and activity.
 */
const indicatorSchema = new mongoose.Schema(
  {
    description: { type: String, required: false }, // Optional description of the indicator
    actual: { type: Number, default: 0 }, // The actual value, defaults to 0
    total: { type: Number, required: true }, // The total value, required
    type: {
      type: String,
      enum: ["NUMERAL", "BINARY", "PERCENTAGE"], // Valid types for the indicator
      required: true,
    },
    operationalPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OperationalPlan", // Reference to the OperationalPlan model
      required: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity", // Reference to the Activity model
      required: true,
    },
    evidence: { type: String, required: false }, // Optional evidence related to the indicator
  },
  { strict: "throw" } // Ensure that no fields outside of the schema are allowed
);

/**
 * Function to validate indicator data.
 * 
 * Validates the provided data to ensure that it adheres to the expected format before saving it to the database.
 * This includes checking for required fields, valid types, and proper lengths for IDs.
 *
 * @param {Object} data - The indicator data to validate.
 * @returns {Object} - Object containing validation errors (if any) and the validated data.
 */
const validateIndicator = (data) => {
  const schema = Joi.object({
    description: Joi.string().optional().label("Description"), // Optional description
    actual: Joi.number().optional().default(0).label("Actual"), // Optional actual value, defaults to 0
    total: Joi.number().required().label("Total"), // Required total value
    type: Joi.string()
      .valid("NUMERAL", "BINARY", "PERCENTAGE")
      .required()
      .label("Type"), // Valid indicator types
    operationalPlanId: Joi.string().length(24).required().label("Operational Plan ID"), // Required 24-character ID
    activityId: Joi.string().length(24).required().label("Activity ID"), // Required 24-character ID
    evidence: Joi.string().optional().label("Evidence"), // Optional evidence field
  });
  return schema.validate(data);
};

// Definition of the Indicator model
const Indicator = mongoose.model("Indicator", indicatorSchema);

// Exporting the Indicator model and the validation function
module.exports = { Indicator, validateIndicator };
