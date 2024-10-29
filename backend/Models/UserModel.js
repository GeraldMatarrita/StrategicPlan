const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

/**
 * User Model.
 */
const userSchema = new mongoose.Schema(
  { 
    name: { type: String, required: true, unique: true },
    realName: { type: String, required: true },
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

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const saltRounds = parseInt(process.env.SALT) || 10; // Number of salt rounds
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

/**
 * Function to validate user data.
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object with errors and the value.
 */
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().label("Name"),
    realName: Joi.string().min(3).max(50).required().label("Real Name"),
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

// Definition of the User model
const User = mongoose.model("User", userSchema);

// Exporting the model and the validation function
module.exports = { User, validateUser };
