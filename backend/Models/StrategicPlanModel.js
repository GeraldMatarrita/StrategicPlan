const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Modelo de planes estratégicos.
 */
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
    FODA_ID: { type: mongoose.Schema.Types.ObjectId, ref: "FODA" }, // Referencia a un esquema FODA
    MECA_ID: { type: mongoose.Schema.Types.ObjectId, ref: "MECA" }, // Referencia a un esquema MECA
    members_ListIDS: [
      {
        type: mongoose.Schema.Types.ObjectId,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referencia al esquema User
      },
    ],
    objective_ListIDS: [
      {
        type: mongoose.Schema.Types.ObjectId,

        objectiveId: { type: mongoose.Schema.Types.ObjectId, ref: "Objective" }, // Referencia al esquema Objective
      },
    ],
    operationPlan_ListIDS: [
      {
        operationPlanId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "OperationPlan",
        },
      },
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
      .items(
        Joi.object({
          userId: Joi.string().required().label("User ID"),
        })
      )
      .optional()
      .label("Members List IDs"),
    objective_ListIDS: Joi.array()
      .items(
        Joi.object({
          objectiveId: Joi.string().required().label("Objective ID"),
        })
      )
      .optional()
      .label("Objective List IDs"),
    operationPlan_ListIDS: Joi.array()
      .items(
        Joi.object({
          operationPlanId: Joi.string().required().label("Operation Plan ID"),
        })
      )
      .optional()
      .label("Operation Plan List IDs"),
  });
  return schema.validate(data);
};

// Definición del modelo de planes estratégicos
const StrategicPlan = mongoose.model("StrategicPlan", strategicPlanSchema);

// Exportación del modelo y la función de validación
module.exports = { StrategicPlan, validateStrategicPlan };
