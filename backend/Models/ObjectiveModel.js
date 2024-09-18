const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Modelo de Objective.
 */
const objectiveSchema = new mongoose.Schema(
  {
    startDate: { type: Date, default: Date.now }, // Fecha automática como 'now'
    description: { type: String, required: true }, // Solo description es required
    totalGoals: { type: Number },
    completedGoals: { type: Number },
    responsible: { type: String },
  },
  { strict: "throw" }
);

/**
 * Función de validación de datos del objetivo.
 * @param {Object} data - Datos a validar.
 * @returns {Object} - Objeto con los errores y el valor.
 */
const validateObjective = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().optional().label("Start Date"), // No es required
    description: Joi.string().min(3).max(255).required().label("Description"), // Único required
    totalGoals: Joi.number().integer().min(1).optional().label("Total Goals"),
    completedGoals: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("totalGoals"))
      .optional()
      .label("Completed Goals"),
    responsible: Joi.string().min(3).max(50).optional().label("Responsible"),
  });
  return schema.validate(data);
};

// Definición del modelo de Objective
const ObjectiveModel = mongoose.model("Objective", objectiveSchema);

// Exportación del modelo y la función de validación
module.exports = { ObjectiveModel, validateObjective };
