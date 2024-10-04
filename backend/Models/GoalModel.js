const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Modelo de Goal.
 */
const goalSchema = new mongoose.Schema(
  {
    startDate: { type: Date, default: Date.now }, // Fecha actual por defecto
    description: { type: String, required: true }, // Solo description es requerido
    totalActivities: { type: Number }, // No requerido
    completedActivities: { type: Number, default: 0 }, // Inicia en 0, no requerido
    Activity_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activities" }, // Referencia a documentos de Activity
    ], // Lista de IDs referenciando a Activities
  },
  { strict: "throw" }
);

/**
 * Función de validación de datos del goal.
 * @param {Object} data - Datos a validar.
 * @returns {Object} - Objeto con los errores y el valor.
 */
const validateGoal = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().optional().label("Start Date"), // No requerido
    description: Joi.string().min(3).max(255).required().label("Description"), // Solo description es requerido
    totalActivities: Joi.number()
      .integer()
      .min(1)
      .optional()
      .label("Total Activities"), // No requerido
    completedActivities: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("totalActivities"))
      .optional()
      .label("Completed Activities"), // No requerido
    Activity_ListIDS: Joi.array()
      .items(Joi.string().hex().length(24))
      .optional()
      .label("Activity List IDS"), // Validación para un array de ObjectIds
  });
  return schema.validate(data);
};

// Definición del modelo de Goal
const GoalModel = mongoose.model("Goal", goalSchema);

// Exportación del modelo y la función de validación
module.exports = { GoalModel, validateGoal };
