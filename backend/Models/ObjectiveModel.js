const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Objective Model.
 */
const objectiveSchema = new mongoose.Schema(
  {
    startDate: { type: Date, default: Date.now },
    title: { type: String, required: true }, // New 'title' field required
    description: { type: String, required: true },
    totalGoals: { type: Number, default: 0 }, // Ensure it has a default value
    completedGoals: { type: Number, default: 0 }, // Similarly here
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goals_ListIDS: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goals" }],
  },
  { strict: "throw" }
);

/**
 * Function to validate objective data.
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object with errors and the value.
 */
const validateObjective = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().optional().label("Start Date"), // Not required
    title: Joi.string().min(3).max(255).required().label("Title"), // Validation for the new 'title' field
    description: Joi.string().min(3).required().label("Description"), // Only description is required
    totalGoals: Joi.number().integer().optional().label("Total Goals"),
    completedGoals: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("totalGoals"))
      .optional()
      .label("Completed Goals"),
    responsible: Joi.string().min(3).max(50).optional().label("Responsible"),
    goals_ListIDS: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .optional()
      .label("Goals List IDs"), // Validation for list of ObjectIDs
  });
  return schema.validate(data);
};

// Definition of the Objective model
const ObjectiveModel = mongoose.model("Objective", objectiveSchema);

// Exporting the model and the validation function
module.exports = { ObjectiveModel, validateObjective };
