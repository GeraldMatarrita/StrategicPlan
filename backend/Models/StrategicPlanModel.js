const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * StrategicPlan Model.
 * 
 * This model represents a strategic plan that includes key fields such as mission, vision, values, 
 * start and end dates, and a name. It also includes references to other entities like SWOT, CAME, 
 * objectives, and operational plans.
 * The model ensures strict adherence to the schema and supports the management of strategic plans 
 * through its associated fields.
 */
const strategicPlanSchema = new mongoose.Schema(
  {
    mission: { type: String }, // Mission of the strategic plan
    vision: { type: String }, // Vision of the strategic plan
    values: { type: String }, // Values of the strategic plan
    startDate: { type: Date, default: Date.now, required: true }, // Start date of the strategic plan, defaulting to the current date
    endDate: { type: Date, required: true }, // End date of the strategic plan, required field
    name: { type: String, required: true }, // Name of the strategic plan
    SWOT: { type: mongoose.Schema.Types.ObjectId, ref: "SWOT" }, // Reference to the SWOT model
    CAME: { type: mongoose.Schema.Types.ObjectId, ref: "CAME" }, // Reference to the CAME model
    members_ListIDS: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of users associated with the plan
    objective_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Objective" }, // List of objectives associated with the plan
    ],
    operationPlan_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "OperationalPlan" }, // List of operational plans associated with the plan
    ],
  },
  { strict: "throw" } // Ensures no extra fields are added outside the schema definition
);

/**
 * Function to validate strategic plan data.
 * 
 * This function validates the provided strategic plan data to ensure it meets the expected format and constraints.
 * It validates required fields like name and end date, and optional fields such as mission, vision, and values.
 * It also validates that the associated lists (members, objectives, and operational plans) contain valid ObjectIDs.
 *
 * @param {Object} data - The strategic plan data to validate.
 * @returns {Object} - Object containing validation errors (if any) and the validated data.
 */
const validateStrategicPlan = (data) => {
  const schema = Joi.object({
    mission: Joi.string().min(10).max(1000).optional().label("Mission"), // Mission is optional, with a length constraint
    vision: Joi.string().min(10).max(1000).optional().label("Vision"), // Vision is optional, with a length constraint
    values: Joi.string().min(10).max(1000).optional().label("Values"), // Values are optional, with a length constraint
    startDate: Joi.date().label("Start Date"), // Start date is optional, with no specific constraints
    endDate: Joi.date().required().label("End Date"), // End date is required
    name: Joi.string().min(1).max(255).required().label("Name"), // Name is required and constrained between 1 and 255 characters

    // Validate lists of associated ObjectIDs, if provided
    members_ListIDS: Joi.array()
      .items(Joi.string().length(24).label("Member ID")) // Ensure each ID is a valid 24-character string
      .optional()
      .label("Members List IDs"),
    objective_ListIDS: Joi.array()
      .items(Joi.string().length(24).label("Objective ID")) // Ensure each ID is a valid 24-character string
      .optional()
      .label("Objective List IDs"),
    operationPlan_ListIDS: Joi.array()
      .items(Joi.string().length(24).label("Operation Plan ID")) // Ensure each ID is a valid 24-character string
      .optional()
      .label("Operation Plan List IDs"),
  });

  return schema.validate(data); // Return the result of the Joi validation
};

// Definition of the StrategicPlan model
const StrategicPlan = mongoose.model("StrategicPlan", strategicPlanSchema);

// Exporting the model and the validation function
module.exports = { StrategicPlan, validateStrategicPlan };
