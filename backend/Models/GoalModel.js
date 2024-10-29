const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Goal Model.
 */
const goalSchema = new mongoose.Schema(
  {
    startDate: { type: Date, default: Date.now }, // Default to current date
    description: { type: String, required: true }, // Only description is required
    totalActivities: { type: Number, required: true, default: 1 }, // totalActivities must be required and have a default value
    completedActivities: { type: Number, default: 0 }, // Starts at 0, not required
    Activity_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activities" }, // Reference to Activity documents
    ], // List of IDs referencing Activities
  },
  { strict: "throw" }
);

/**
 * Function to validate goal data.
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object with errors and the value.
 */
const validateGoal = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().optional().label("Start Date"), // Not required
    description: Joi.string().min(3).max(255).required().label("Description"), // Required
    totalActivities: Joi.number().integer().min(1).default(1).label("Total Activities"), // Not required, default value 1
    completedActivities: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("totalActivities"))
      .default(0) // Default value 0
      .label("Completed Activities"),
    Activity_ListIDS: Joi.array()
      .items(Joi.string().hex().length(24))
      .optional()
      .label("Activity List IDS"),
  });
  return schema.validate(data);
};

// Definition of the Goal model
const GoalModel = mongoose.model("Goal", goalSchema);

// Exporting the model and the validation function
module.exports = { GoalModel, validateGoal };
