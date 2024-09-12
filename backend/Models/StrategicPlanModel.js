const mongoose = require("mongoose");
const Joi = require("joi");

// Esquema FODA
const fodaSchema = new mongoose.Schema({
  strengths: { type: String },
  opportunities: { type: String },
  weaknesses: { type: String },
  threats: { type: String },
});

// Esquema MECA
const mecaSchema = new mongoose.Schema({
  correct: { type: String },
  adapt: { type: String },
  maintain: { type: String },
  explore: { type: String },
});

// Esquema del plan estratégico
const strategicPlanSchema = new mongoose.Schema(
  {
    mission: { type: String },
    vision: { type: String },
    values: { type: String },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date, required: true },
    name: { type: String, required: true },
    FODA: fodaSchema,
    MECA: mecaSchema,
    members_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referencia directa
    ],
    objective_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Objective" }, // Referencia directa
    ],
    operationPlan_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "OperationPlan" }, // Referencia directa
    ],
  },
  { strict: "throw" }
);

// Esquema de validación Joi para FODA
const fodaValidationSchema = Joi.object({
  strengths: Joi.string().optional(),
  opportunities: Joi.string().optional(),
  weaknesses: Joi.string().optional(),
  threats: Joi.string().optional(),
}).optional();

// Esquema de validación Joi para MECA
const mecaValidationSchema = Joi.object({
  correct: Joi.string().optional(),
  adapt: Joi.string().optional(),
  maintain: Joi.string().optional(),
  explore: Joi.string().optional(),
}).optional();

// Función de validación de datos de planes estratégicos
const validateStrategicPlan = (data) => {
  const schema = Joi.object({
    mission: Joi.string().min(10).max(1000).optional().label("Mission"),
    vision: Joi.string().min(10).max(1000).optional().label("Vision"),
    values: Joi.string().min(10).max(1000).optional().label("Values"),
    startDate: Joi.date().label("Start Date"),
    endDate: Joi.date().required().label("End Date"),
    name: Joi.string().min(1).max(255).required().label("Name"),
    FODA: fodaValidationSchema,
    MECA: mecaValidationSchema,
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

// Definición del modelo de planes estratégicos
const StrategicPlan = mongoose.model("StrategicPlan", strategicPlanSchema);

// Exportación del modelo y la función de validación
module.exports = { StrategicPlan, validateStrategicPlan };
