const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

/**
 * Modelo de usuario.
 */
const userSchema = new mongoose.Schema(
  { 
    name: { type: String, required: true, unique: true },
    realName: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    strategicPlans_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "StrategicPlan" },
    ],
    invitations: [
      {
        planId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StrategicPlan",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],
  },
  { strict: "throw" }
);

// Middleware para encriptar la contraseña antes de guardar el usuario
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const saltRounds = parseInt(process.env.SALT) || 10; // Número de rondas de sal
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

/**
 * Función de validación de datos de usuario.
 * @param {Object} data - Datos a validar.
 * @returns {Object} - Objeto con los errores y el valor.
 */
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().label("Name"),
    realName: Joi.string().min(3).max(50).required().label("realName"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(2).required().label("Password"),
    strategicPlans_ListIDS: Joi.array()
      .items(Joi.string().length(24))
      .optional()
      .label("Strategic Plans List IDs"),
    invitations: Joi.array()
      .items(
        Joi.object({
          planId: Joi.string().required().label("Plan ID"),
          status: Joi.string()
            .valid("pending", "accepted", "declined")
            .default("pending")
            .label("Status"),
        })
      )
      .optional()
      .label("Invitations"),
  });
  return schema.validate(data);
};

// Definición del modelo de usuario
const User = mongoose.model("User", userSchema);

// Exportación del modelo y la función de validación
module.exports = { User, validateUser };
