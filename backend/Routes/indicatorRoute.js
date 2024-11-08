const express = require("express");
const { Indicator, validateIndicator } = require("../Models/IndicatorModel"); // Adjust the path as necessary
const { Activity } = require("../Models/ActivityModel"); // Assuming Activity model is exported from Models

const router = express.Router();

// Get an indicator by ID
router.get("/getIndicator/:id", async (req, res) => {
  try {
    const indicator = await Indicator.findById(req.params.id);
    if (!indicator) return res.status(404).send("Indicator not found.");
    res.send(indicator);
  } catch (error) {
    res.status(500).send("Error retrieving indicator: " + error.message);
  }
});

// Get indicators by OperationalPlanId
router.get("/getIndicatorsByPlan/:operationalPlanId", async (req, res) => {
  try {
    const indicators = await Indicator.find({ operationalPlanId: req.params.operationalPlanId });
    res.send(indicators);
  } catch (error) {
    res.status(500).send("Error retrieving indicators: " + error.message);
  }
});

// Create a new indicator
router.post("/create", async (req, res) => {
  const { error } = validateIndicator(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const indicator = new Indicator(req.body);
  try {
    await indicator.save();
    res.status(201).send(indicator);
  } catch (error) {
    res.status(500).send("Error creating indicator: " + error.message);
  }
});

// Update an indicator by ID
router.put("/update/:id", async (req, res) => {
  try {
    const indicator = await Indicator.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the new data against the schema
    });

    if (!indicator) return res.status(404).send("Indicator not found.");
    res.send(indicator);
  } catch (error) {
    res.status(500).send("Error updating indicator: " + error.message);
  }
});

// Delete an indicator by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const indicator = await Indicator.findByIdAndDelete(req.params.id);
    if (!indicator) return res.status(404).send("Indicator not found.");

    // Remove reference from activities
    await Activity.updateMany(
      { currentIndicatorId: req.params.id },
      { $set: { currentIndicatorId: null } } // You may want to set it to another value or remove the field entirely
    );

    res.send(indicator);
  } catch (error) {
    res.status(500).send("Error deleting indicator: " + error.message);
  }
});

module.exports = router;
