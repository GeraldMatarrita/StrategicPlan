const express = require("express");
const { Activity, validateActivity } = require("../Models/ActivityModel"); // Adjust the path as necessary
const { Indicator } = require("../Models/IndicatorModel"); // Assuming Indicator model is exported from Models

const router = express.Router();

// Get an activity by ID
router.get("/:id", async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).send("Activity not found.");
    res.send(activity);
  } catch (error) {
    res.status(500).send("Error retrieving activity: " + error.message);
  }
});

// Create a new activity
router.post("/", async (req, res) => {
  const { error } = validateActivity(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const activity = new Activity(req.body);
  try {
    await activity.save();
    res.status(201).send(activity);
  } catch (error) {
    res.status(500).send("Error creating activity: " + error.message);
  }
});

// Update an activity by ID
router.put("/:id", async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the new data against the schema
    });

    if (!activity) return res.status(404).send("Activity not found.");
    res.send(activity);
  } catch (error) {
    res.status(500).send("Error updating activity: " + error.message);
  }
});

// Delete an activity by ID
router.delete("/:id", async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).send("Activity not found.");

    // Remove the associated Indicator using the currentIndicatorId
    if (activity.currentIndicatorId) {
      await Indicator.findByIdAndDelete(activity.currentIndicatorId);
    }

    await Activity.findByIdAndDelete(req.params.id);
    res.send(activity);
  } catch (error) {
    res.status(500).send("Error deleting activity: " + error.message);
  }
});

module.exports = router;
