const mongoose = require("mongoose");
const Joi = require("joi");



// Esquema del plan estratégico
const strategicPlanSchema = new mongoose.Schema(
  {
    mission: { type: String },
    vision: { type: String },
    values: { type: String },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date, required: true },
    name: { type: String, required: true },
    SWOT : {type:mongoose.Schema.Types.ObjectId,ref: "SWOT"},
    CAME : {type:mongoose.Schema.Types.ObjectId,ref: "CAME"},
    members_ListIDS:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    objective_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Objective" },
    ],
    operationPlan_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "OperationPlan" },
    ],
  },
  { strict: "throw" }
);


// Function to validate strategic plan data
const validateStrategicPlan = (data) => {
  const schema = Joi.object({
    mission: Joi.string().min(10).max(1000).optional().label("Mission"),
    vision: Joi.string().min(10).max(1000).optional().label("Vision"),
    values: Joi.string().min(10).max(1000).optional().label("Values"),
    startDate: Joi.date().label("Start Date"),
    endDate: Joi.date().required().label("End Date"),
    name: Joi.string().min(1).max(255).required().label("Name"),

    members_ListIDS: Joi.array()
      .items(Joi.string().length(24).label("Member ID"))
      .optional()
      .label("Members List IDs"),
    objective_ListIDS: Joi.array()
      .items(Joi.string().length(24).label("Objective ID"))
      .optional()
      .label("Objective List IDs"),
    operationPlan_ListIDS: Joi.array()
      .items(Joi.string().length(24).label("Operation Plan ID"))
      .optional()
      .label("Operation Plan List IDs"),
  });

  return schema.validate(data);
};

// Definition of the StrategicPlan model
const StrategicPlan = mongoose.model("StrategicPlan", strategicPlanSchema);

// Exporting the model and the validation function
module.exports = { StrategicPlan, validateStrategicPlan };
