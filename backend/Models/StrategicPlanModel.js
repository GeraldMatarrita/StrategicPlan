const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Modelo de planes estratégicos.
 */
const strategicPlanSchema = new mongoose.Schema(
  {
    mission: { type: String },
    vision: { type: String },
    values: { type: String },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date, required: true },
    name: { type: String, required: true },
    FODA_ID: { type: mongoose.Schema.Types.ObjectId, ref: "FODA" },
    MECA_ID: { type: mongoose.Schema.Types.ObjectId, ref: "MECA" },
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

/**
 * Función de validación de datos de planes estratégicos.
 * @param {Object} data - Datos a validar.
 * @returns {Object} - Objeto con los errores y el valor.
 */
const validateStrategicPlan = (data) => {
  const schema = Joi.object({
    mission: Joi.string().min(10).max(1000).optional().label("Mission"),
    vision: Joi.string().min(10).max(1000).optional().label("Vision"),
    values: Joi.string().min(10).max(1000).optional().label("Values"),
    startDate: Joi.date().label("Start Date"),
    endDate: Joi.date().required().label("End Date"),
    name: Joi.string().min(1).max(255).required().label("Name"),
    FODA_ID: Joi.string().optional().label("FODA ID"),
    MECA_ID: Joi.string().optional().label("MECA ID"),
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
