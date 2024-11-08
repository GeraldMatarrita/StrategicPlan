const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Goal Model.
 * 
 * This model represents a goal within the system. It includes key fields such as the start date, description,
 * total number of activities, completion status, and a reference to a list of associated activities.
 * The model ensures that certain fields are required and validated, while others are optional with default values.
 */
const goalSchema = new mongoose.Schema(
  {
    startDate: { type: Date, default: Date.now }, // Start date of the goal, defaults to the current date if not specified
    description: { type: String, required: true }, // Description of the goal, required field
    totalActivities: { type: Number, required: true, default: 1 }, // Total number of activities required for the goal, default value is 1
    completed: { type: Boolean, default: false }, // Completion status of the goal, defaults to false
    Activity_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" }, // List of IDs referencing Activity documents
    ], // Optional list of activities associated with the goal
  },
  { strict: "throw" } // Ensures no fields other than those defined in the schema can be saved
);

/**
 * Function to validate goal data.
 * 
 * This function validates the data for the goal, ensuring it adheres to the schema constraints. It includes validation
 * for required fields like description, and ensures that the number of completed activities is not greater than the 
 * total activities. Optional fields such as start date and activity list IDs are also validated.
 *
 * @param {Object} data - The goal data to validate.
 * @returns {Object} - Object containing validation errors (if any) and the validated data.
 */
const validateGoal = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().optional().label("Start Date"), // Start date is optional
    description: Joi.string().min(3).max(255).required().label("Description"), // Description is required and must be between 3 and 255 characters
    completed: Joi.boolean().optional().label("Completed"), // Completion status is optional
    completedActivities: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("totalActivities"))
      .default(0) // Completed activities must be an integer between 0 and totalActivities, defaulting to 0
      .label("Completed Activities"),
    Activity_ListIDS: Joi.array()
      .items(Joi.string().hex().length(24)) // Ensure that the activity IDs are valid 24-character hexadecimal strings
      .optional()
      .label("Activity List IDS"), // Activity list is optional
  });
  return schema.validate(data); // Return the result of the Joi validation
};

// Definition of the Goal model
const Goal = mongoose.model("Goal", goalSchema);

// Exporting the model and the validation function
module.exports = { Goal, validateGoal };
