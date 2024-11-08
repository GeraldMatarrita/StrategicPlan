const mongoose = require("mongoose");
const Joi = require("joi");

/**
 * Activity Model.
 * 
 * This model represents individual activities that are part of the broader Goals and Operational Plans
 * within the system. Each activity has an associated title, description, a responsible user, and
 * optional indicators that track progress or measure performance.
 */
const activitySchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      maxlength: 50 
    }, // Title of the activity (maximum 50 characters)
    
    description: { 
      type: String, 
      required: true 
    }, // Detailed description of the activity
    
    responsible: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // ID of the user responsible for this activity, referencing the User model
    
    indicators_ListIDS: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Indicator"
      },
    ], // Array of IDs that reference Indicator documents, used to track specific metrics for the activity
  },
  { strict: "throw" } // Strict schema, throws an error if fields outside of the schema are provided
);

/**
 * Function to validate activity data.
 * 
 * Ensures that the activity data conforms to the expected format before being saved to the database.
 * This function validates the structure, types, and constraints of the activity fields.
 *
 * @param {Object} data - Data to validate.
 * @returns {Object} - Object containing any validation errors and the validated value.
 */
const validateActivity = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(50).required().label("Title"),
    description: Joi.string().required().label("Description"),
    responsible: Joi.string().length(24).required().label("Responsible User ID"),
    indicators_ListIDS: Joi.array()
      .items(Joi.string().length(24))
      .optional()
      .label("Indicators IDs") // Optional array of Indicator IDs
  });
  return schema.validate(data);
};

// Definition of the Activity model
const Activity = mongoose.model("Activity", activitySchema);

// Exporting the Activity model and the validation function
module.exports = { Activity, validateActivity };
