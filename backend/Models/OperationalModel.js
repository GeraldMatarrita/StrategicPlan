const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * OperationalPlan Model.
 */
const operationalPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 300 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activitiesIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    ],
    completedActivities: { type: Number, default: 0 },
    totalActivities: { type: Number, default: 0 },
    active: { type: Boolean, default: true }, 
  },
  { strict: "throw" }
);

/**
 * Function to validate operational plan data.
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object with errors and the value.
 */
const validateOperationalPlan = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(300).required().label("Title"),
    startDate: Joi.date().required().label("Start Date"),
    endDate: Joi.date().required().label("End Date"),
    activitiesIds: Joi.array()
      .items(Joi.string().length(24))
      .optional()
      .label("Activities IDs"),
    completedActivities: Joi.number().optional().default(0).label("Completed Activities"),
    totalActivities: Joi.number().optional().default(0).label("Total Activities"),
    active: Joi.boolean().optional().default(true).label("Active"), // New validation for active field
  });
  return schema.validate(data);
};

// Definition of the OperationalPlan model
const OperationalPlan = mongoose.model("OperationalPlan", operationalPlanSchema);

// Exporting the model and the validation function
module.exports = { OperationalPlan, validateOperationalPlan };
