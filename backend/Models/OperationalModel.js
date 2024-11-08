const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * OperationalPlan Model.
 * 
 * This model represents an operational plan that includes the title, start and end dates, and its active status.
 * It includes validation for required fields and optional fields.
 */
const operationalPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 300 }, // Title of the operational plan, max length 300
    startDate: { type: Date, required: true }, // Required start date for the operational plan
    endDate: { type: Date, required: true }, // Required end date for the operational plan
    active: { type: Boolean, default: true }, // Boolean indicating if the plan is active or not, defaults to true
  },
  { strict: "throw" } // Ensures no fields other than those defined in the schema can be saved
);

/**
 * Function to validate operational plan data.
 * 
 * This function validates the data for the operational plan to ensure it meets the correct format and constraints.
 * It includes validation for required fields like title, start date, and end date, as well as ensuring the end date
 * is after the start date.
 *
 * @param {Object} data - The operational plan data to validate.
 * @returns {Object} - Object containing validation errors (if any) and the validated data.
 */
const validateOperationalPlan = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(300).required().label("Title"), // Title is required and can be up to 300 characters
    startDate: Joi.date().required().label("Start Date"), // Start date is required
    endDate: Joi.date().greater(Joi.ref("startDate")).required().label("End Date"), // End date must be after the start date
    active: Joi.boolean().optional().default(true).label("Active"), // Active status is optional, defaults to true
  });
  return schema.validate(data);
};

// Definition of the OperationalPlan model
const OperationalPlan = mongoose.model("OperationalPlan", operationalPlanSchema);

// Exporting the model and the validation function
module.exports = { OperationalPlan, validateOperationalPlan };
