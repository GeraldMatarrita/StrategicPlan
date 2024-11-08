const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

/**
 * User Model.
 * 
 * This schema defines the structure of a User object in the database.
 * It includes fields such as `name`, `realName`, `email`, `password`, and others 
 * related to the user's participation in strategic plans and invitations.
 */
const userSchema = new mongoose.Schema(
  { 
    name: { type: String, required: true, unique: true }, // Unique username
    realName: { type: String, required: true }, // Full name of the user
    email: { type: String, required: true, unique: true }, // Unique email address for the user
    password: { type: String, required: true }, // Password for user authentication
    resetPasswordToken: { type: String }, // Token used to reset the password
    resetPasswordExpires: { type: Date }, // Expiry time for the reset password token
    strategicPlans_ListIDS: [
      { type: mongoose.Schema.Types.ObjectId, ref: "StrategicPlan" }, // Reference to the strategic plans the user is part of
    ],
    invitations: [
      {
        planId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StrategicPlan", // Reference to a strategic plan invitation
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"], // Possible statuses of the invitation
          default: "pending", // Default status is 'pending'
        },
      },
    ],
  },
  { strict: "throw" } // Ensures that no undefined fields are allowed in the document
);

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const saltRounds = parseInt(process.env.SALT) || 10; // Number of salt rounds
    this.password = await bcrypt.hash(this.password, saltRounds); // Hash the password using bcrypt
  }
  next(); // Proceed to save the document
});

/**
 * Function to validate user data.
 * 
 * This function validates the user input based on predefined rules using Joi.
 * It checks for required fields and applies specific validation logic for each one.
 * 
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object containing errors (if any) and the validated value.
 */
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().label("Name"), // Name must be a string with 3 to 50 characters
    realName: Joi.string().min(3).max(50).required().label("Real Name"), // Real name must be a string with 3 to 50 characters
    email: Joi.string().email().required().label("Email"), // Email must be a valid email address
    password: Joi.string().min(2).required().label("Password"), // Password must be a string with a minimum length of 2 characters
    strategicPlans_ListIDS: Joi.array()
      .items(Joi.string().length(24)) // Each ID should be a 24-character string (ObjectId)
      .optional()
      .label("Strategic Plans List IDs"),
    invitations: Joi.array()
      .items(
        Joi.object({
          planId: Joi.string().required().label("Plan ID"), // Plan ID must be a valid string
          status: Joi.string()
            .valid("pending", "accepted", "declined") // Status can only be one of the valid options
            .default("pending") // Default value for status is 'pending'
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
