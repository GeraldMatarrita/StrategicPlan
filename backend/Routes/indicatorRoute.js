const express = require("express");
const { Indicator, validateIndicator } = require("../Models/IndicatorModel"); // Adjust the path as necessary
const { Activity } = require("../Models/ActivityModel"); // Assuming Activity model is exported from Models

const router = express.Router();

/**
 * Get an indicator by ID.
 * This route retrieves an indicator by its unique identifier.
 * @param {string} id.path.required - The ID of the indicator to retrieve
 * @returns {object} 200 - The indicator object
 * @returns {string} 404 - Indicator not found
 * @returns {string} 500 - Error message
 */
router.get("/getIndicator/:id", async (req, res) => {
  try {
    // Find the indicator by ID
    const indicator = await Indicator.findById(req.params.id);
    if (!indicator) return res.status(404).send("Indicator not found."); // If no indicator is found, return an error
    res.send(indicator);
  } catch (error) {
    res.status(500).send("Error retrieving indicator: " + error.message); // Handle server error
  }
});

/**
 * Get all indicators associated with a specific operational plan.
 * This route retrieves all indicators associated with a specific operational plan.
 * @param {string} operationalPlanId.path.required - The ID of the operational plan
 * @returns {object} 200 - List of indicators
 * @returns {string} 500 - Error message
 */
router.get("/getIndicatorsByPlan/:operationalPlanId", async (req, res) => {
  try {
    // Find all indicators associated with the operational plan
    const indicators = await Indicator.find({ operationalPlanId: req.params.operationalPlanId });
    res.send(indicators); // Send the list of indicators
  } catch (error) {
    res.status(500).send("Error retrieving indicators: " + error.message); // Handle server error
  }
});

/**
 * Create a new indicator.
 * This route creates a new indicator.
 * @param {object} body.body.required - The indicator data to create
 * @returns {object} 201 - The created indicator object
 * @returns {string} 400 - Error message
 * @returns {string} 500 - Error message
 */
router.post("/create", async (req, res) => {
  const { error } = validateIndicator(req.body); // Validate the request body
  if (error) return res.status(400).send(error.details[0].message); // If validation fails, return an error

  const indicator = new Indicator(req.body); // Create a new indicator object
  try {
    await indicator.save(); // Save the new indicator to the database
    res.status(201).send(indicator); // Send the created indicator object
  } catch (error) {
    res.status(500).send("Error creating indicator: " + error.message); // Handle server error
  }
});

/**
 * Update an indicator by ID.
 * This route updates an existing indicator with new data.
 * @param {string} id.path.required - The ID of the indicator to update
 * @param {object} body.body.required - The updated indicator data
 * @returns {object} 200 - The updated indicator object
 * @returns {string} 404 - Indicator not found
 * @returns {string} 500 - Error message
 */
router.put("/update/:id", async (req, res) => {
  try {
    // Find the indicator by ID and update it with the new data
    const indicator = await Indicator.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the new data against the schema
    });

    if (!indicator) return res.status(404).send("Indicator not found."); // If no indicator is found, return an error
    res.send(indicator);
  } catch (error) {
    res.status(500).send("Error updating indicator: " + error.message); // Handle server error
  }
});

/**
 * Delete an indicator by ID.
 * This route deletes an indicator by its unique identifier.
 * @param {string} id.path.required - The ID of the indicator to delete
 * @returns {object} 200 - The deleted indicator object
 * @returns {string} 404 - Indicator not found
 * @returns {string} 500 - Error message
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    // Find the indicator by ID and delete it
    const indicator = await Indicator.findByIdAndDelete(req.params.id);
    if (!indicator) return res.status(404).send("Indicator not found."); // If no indicator is found, return an error

    // Remove reference from activities
    await Activity.updateMany(
      { currentIndicatorId: req.params.id },
      { $set: { currentIndicatorId: null } } // Remove the reference to the deleted indicator
    );

    res.send(indicator);
  } catch (error) {
    res.status(500).send("Error deleting indicator: " + error.message); // Handle server error
  }
});

// Export the router
module.exports = router;
