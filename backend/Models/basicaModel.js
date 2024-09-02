const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Modelo básico.
 */
const basicaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    years: { type: Number, required: true },
  },
  { strict: "throw" }
);

/**
 * Función de validación de datos básicos.
 * @param {Object} data - Datos a validar.
 * @returns {Object} - Objeto con los errores y el valor.
 */
const validateBasica = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(255).required().label("Name"),
    years: Joi.number().integer().min(18).required().label("Years"),
  });
  return schema.validate(data);
};

// Definición del modelo básico
const Basica = mongoose.model("Basica", basicaSchema);

// Exportación del modelo y la función de validación
module.exports = { BasicaModel: Basica, validateBasica };
