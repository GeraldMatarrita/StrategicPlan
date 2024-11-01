const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Activity Model.
 */
const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 50 },
    description: { type: String, required: true },
    responsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentIndicatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Indicator",
      required: true,
    },
    passedIndicatorsIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Indicator",
      },
    ],
    completed: { type: Boolean, default: false },
    completedDate: { type: Date, required: false },
  },
  { strict: "throw" }
);

/**
 * Function to validate activity data.
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object with errors and the value.
 */
const validateActivity = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(50).required().label("Title"),
    description: Joi.string().required().label("Description"),
    responsible: Joi.string().length(24).required().label("Responsible User ID"),
    currentIndicatorId: Joi.string().length(24).required().label("Current Indicator ID"),
    passedIndicatorsIds: Joi.array().items(Joi.string().length(24)).optional().label("Passed Indicators IDs"),
    completed: Joi.boolean().optional().default(false).label("Completed"),
    completedDate: Joi.date().optional().label("Completed Date"),
  });
  return schema.validate(data);
};

// Definition of the Activity model
const Activity = mongoose.model("Activity", activitySchema);

// Exporting the model and the validation function
module.exports = { Activity, validateActivity };
