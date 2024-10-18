const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Modelo de Objective.
 */
const objectiveSchema = new mongoose.Schema(
  {
    startDate: { type: Date, default: Date.now },
    title: { type: String, required: true }, // Nuevo campo 'title' requerido
    description: { type: String, required: true },
    totalGoals: { type: Number, default: 0 }, // Asegúrate de que tenga un valor predeterminado
    completedGoals: { type: Number, default: 0 }, // Igualmente aquí
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goals_ListIDS: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goals" }],
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
    startDate: Joi.date().optional().label("Start Date"), // No es requerido
    title: Joi.string().min(3).max(255).required().label("Title"), // Validación para el nuevo campo 'title'
    description: Joi.string().min(3).required().label("Description"), // Solo description es requerido
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
      .label("Goals List IDs"), // Validación de lista de ObjectIDs
  });
  return schema.validate(data);
};

// Definición del modelo de Objective
const ObjectiveModel = mongoose.model("Objective", objectiveSchema);

// Exportación del modelo y la función de validación
module.exports = { ObjectiveModel, validateObjective };
