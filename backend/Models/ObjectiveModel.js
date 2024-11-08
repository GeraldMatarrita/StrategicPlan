const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Objective Model.
 * 
 * This model represents an objective within the operational plans. It includes a title, description,
 * total goals, completed goals, a reference to a responsible user, and a list of associated goals.
 */
const objectiveSchema = new mongoose.Schema(
  {
    startDate: { type: Date, default: Date.now }, // The date the objective starts (default to current date)
    title: { type: String, required: true }, // Required title for the objective
    description: { type: String, required: true }, // Required description of the objective
    totalGoals: { type: Number, default: 0 }, // Total number of goals associated with the objective, defaults to 0
    completedGoals: { type: Number, default: 0 }, // Number of completed goals, defaults to 0
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user responsible for the objective
    goals_ListIDS: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goal" }], // List of Goal references associated with this objective
  },
  { strict: "throw" } // Ensures only fields defined in the schema can be saved
);

/**
 * Function to validate objective data.
 * 
 * This function validates the provided data to ensure it meets the expected format before saving it to the database.
 * It includes validation for required fields, proper lengths, and specific conditions for the fields.
 *
 * @param {Object} data - The objective data to validate.
 * @returns {Object} - Object containing validation errors (if any) and the validated data.
 */
const validateObjective = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().optional().label("Start Date"), // Optional start date
    title: Joi.string().min(3).max(255).required().label("Title"), // Title is required and must be between 3 and 255 characters
    description: Joi.string().min(3).required().label("Description"), // Description is required and must be at least 3 characters long
    totalGoals: Joi.number().integer().optional().label("Total Goals"), // Total goals is optional, but should be an integer
    completedGoals: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("totalGoals")) // Completed goals must be between 0 and total goals
      .optional()
      .label("Completed Goals"),
    responsible: Joi.string().length(24).required().label("Responsible User ID"), // Responsible user ID, required and must be 24 characters (ObjectId format)
    goals_ListIDS: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)) // Validates that each ID in the list is a valid 24-character ObjectId
      .optional()
      .label("Goals List IDs"),
  });
  return schema.validate(data);
};

// Definition of the Objective model
const ObjectiveModel = mongoose.model("Objective", objectiveSchema);

// Exporting the model and the validation function
module.exports = { ObjectiveModel, validateObjective };
