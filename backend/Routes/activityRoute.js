const express = require("express");
const { Activity, validateActivity } = require("../Models/ActivityModel");
const { Indicator } = require("../Models/IndicatorModel"); 
const { Goal } = require("../Models/GoalModel"); 

const router = express.Router();


/**
 * Get an activity by ID.
 * This route retrieves an activity by its unique identifier.
 * @param {string} id.path.required - The ID of the activity to retrieve
 * @returns {object} 200 - The activity object
 * @returns {string} 500 - Error message
 */
router.get("/getActivity/:id", async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id); // Find the activity by ID
    if (!activity) return res.status(404).send("Activity not found."); // If no activity is found, return an error
    res.send(activity); // Send the activity object
  } catch (error) {
    res.status(500).send("Error retrieving activity: " + error.message); // Handle server error
  }
});

/**
 * Create a new activity.
 * This route creates a new activity and associates it with a specific goal.
 * @param {string} goalId.path.required - The ID of the goal to associate the activity with
 * @param {object} body.body.required - The activity data to create
 * @returns {object} 201 - The created activity object
 * @returns {string} 400 - Error message
 * @returns {string} 404 - Goal not found
 * @returns {string} 500 - Error message
 */
router.post("/create/:goalId", async (req, res) => {

  const { error } = validateActivity(req.body); // Validate the request body
  if (error) return res.status(400).send(error.details[0].message); // If validation fails, return an error

  const activity = new Activity(req.body); // Create a new activity object
  try {
    await activity.save();

    // Find the goal by ID
    const goalId = req.params.goalId;
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).send("Goal not found");

    // Add the new activity to the Activity_ListIDS of the goal
    goal.Activity_ListIDS.push(activity);
    await goal.save();

    res.status(201).send(activity);
  } catch (error) {
    res.status(500).send("Error creating activity: " + error.message);
  }
});

// Update an activity by ID
router.put("/update/:id", async (req, res) => {
  try {

    // Find the activity by ID and update it with the new data
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the new data against the schema
    });

    // If no activity is found, return an error
    if (!activity) return res.status(404).send("Activity not found.");
    res.send(activity); // Send the updated activity object
  } catch (error) {
    res.status(500).send("Error updating activity: " + error.message); // Handle server error
  }
});

/**
 * Delete an activity by ID.
 * This route deletes an activity by its unique identifier.
 * @param {string} id.path.required - The ID of the activity to delete
 * @returns {object} 200 - The deleted activity object
 * @returns {string} 404 - Activity not found
 * @returns {string} 500 - Error message
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id); // Find the activity by ID
    if (!activity) return res.status(404).send("Activity not found."); // If no activity is found, return an error

    // Remove the associated Indicator using the currentIndicatorId
    if (activity.currentIndicatorId) {
      await Indicator.findByIdAndDelete(activity.currentIndicatorId);
    }

    // Delete the activity
    await Activity.findByIdAndDelete(req.params.id);
    res.send(activity); // Send the deleted activity object
  } catch (error) {
    res.status(500).send("Error deleting activity: " + error.message); // Handle server error
  }
});

// Export the router
module.exports = router;
