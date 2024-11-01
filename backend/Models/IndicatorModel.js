const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Indicator Model.
 */
const indicatorSchema = new mongoose.Schema(
  {
    description: { type: String, required: false },
    actual: { type: Number, default: 0 },
    total: { type: Number, required: true },
    type: {
      type: String,
      enum: ["NUMERAL", "BINARIO", "PORCENTUAL"],
      required: true,
    },
    OperationalPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OperationalPlan",
      required: true,
    },
    completed: { type: Boolean, default: false }, // Removed ActivityId
  },
  { strict: "throw" }
);

/**
 * Function to validate indicator data.
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object with errors and the value.
 */
const validateIndicator = (data) => {
  const schema = Joi.object({
    description: Joi.string().optional().label("Description"),
    actual: Joi.number().optional().default(0).label("Actual"),
    total: Joi.number().required().label("Total"),
    type: Joi.string()
      .valid("NUMERAL", "BINARIO", "PORCENTUAL")
      .required()
      .label("Type"),
    OperationalPlanId: Joi.string().length(24).required().label("Operational Plan ID"),
    completed: Joi.boolean().optional().default(false).label("Completed"),
  });
  return schema.validate(data);
};

// Definition of the Indicator model
const Indicator = mongoose.model("Indicator", indicatorSchema);

// Exporting the model and the validation function
module.exports = { Indicator, validateIndicator };
