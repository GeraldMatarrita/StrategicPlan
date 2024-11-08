const express = require("express");
const router = express.Router();
const {
  OperationalPlan,
  validateOperationalPlan,
} = require("../Models/OperationalModel");
const { StrategicPlan } = require("../Models/StrategicPlanModel");
const { Indicator } = require("../Models/IndicatorModel");
const { Activity } = require("../Models/ActivityModel");

/**
 * Retrieve an Operational Plan by its ID
 * @param {String} id - ID of the operational plan
 * @returns {Object} - Operational plan data or error message
 * @throws {Object} - Error message if operational plan not found or server error occurs
 */
router.get("/getOperationalPlan/:id", async (req, res) => {
  try {
    // Find the operational plan by ID
    const plan = await OperationalPlan.findById(req.params.id);
    if (!plan) return res.status(404).send("Operational plan not found."); // If no operational plan is found, return an error
    res.send(plan);
  } catch (error) {
    res.status(500).send("Server error while fetching operational plan."); // Handle server error
  }
});

/**
 * Retrieve all Operational Plans linked to a Strategic Plan by its ID
 * @param {String} id - ID of the strategic plan
 * @returns {Array} - List of operational plans or error message
 * @throws {Object} - Error message if operational plan not found or server error occurs
 */
router.get("/getOperationalPlansByStrategicPlanId/:id", async (req, res) => {
  try {
    // Find the strategic plan by ID and populate the operationPlan_ListIDS field
    const strategicPlan = await StrategicPlan.findById(req.params.id).populate(
      "operationPlan_ListIDS"
    );
    const plans = strategicPlan.operationPlan_ListIDS; // Get the list of operational plans from the strategic plan
    if (!plans) return res.status(404).send("Operational plan not found."); // If no operational plan is found, return an error
    res.send(plans);
  } catch (error) {
    res.status(500).send("Server error while fetching operational plan."); // Handle server error
  }
});

/**
 * Retrieve the active Operational Plan
 * @returns {Object} - Active operational plan data or error message
 * @throws {Object} - Error message if no active operational plan is found or server error occurs
 */
router.get("/active", async (req, res) => {
  try {
    const activePlan = await OperationalPlan.findOne({ active: true }); // Find the active operational plan
    if (!activePlan)
      return res.status(404).send("No active operational plan found."); // If no active operational plan is found, return an error
    res.send(activePlan);
  } catch (error) {
    res
      .status(500)
      .send("Server error while fetching active operational plan."); // Handle server error
  }
});

/**
 * Retrieve all Operational Plans (both active and inactive)
 * @returns {Array} - List of all operational plans
 * @throws {Object} - Error message if a server error occurs
 */
router.get("/getOperationalPlans", async (req, res) => {
  try {
    const inactivePlans = await OperationalPlan.find(); // Find all operational plans
    res.send(inactivePlans); // Send the list of operational plans
  } catch (error) {
    res
      .status(500)
      .send("Server error while fetching inactive operational plans."); // Handle server error
  }
});

/**
 * Create a new Operational Plan linked to a Strategic Plan by ID
 * @param {String} strategicPlanId - ID of the strategic plan
 * @param {Object} req.body - Data of the new operational plan
 * @returns {Object} - Success message with the new operational plan ID or error message
 * @throws {Object} - Error message if validation, database, or server error occurs
 */
router.post("/create/:strategicPlanId", async (req, res) => {
  const { error } = validateOperationalPlan(req.body); // Validate the request body
  if (error) return res.status(400).send(error.details[0].message); // If validation fails, return an error

  try {
    const strategicPlanId = req.params.strategicPlanId; // Get the strategic plan ID from the request parameters
    const newPlanData = req.body; // Get the operational plan data from the request body

    // Create the new Operational Plan
    const newOperationalPlan = new OperationalPlan(newPlanData);
    await newOperationalPlan.save();

    // Find the related Strategic Plan
    const strategicPlan = await StrategicPlan.findById(
      strategicPlanId
    ).populate("operationPlan_ListIDS"); // Find the strategic plan by ID and populate the operationPlan_ListIDS field

    if (!strategicPlan) return res.status(404).send("Strategic Plan not found"); // If no strategic plan is found, return an error

    // Copy indicators from the last Operational Plan, if it exists
    const lastOperationalPlan =
      strategicPlan.operationPlan_ListIDS.slice(-1)[0];

    if (lastOperationalPlan) {
      const indicatorsToCopy = await Indicator.find({
        operationalPlanId: lastOperationalPlan._id, // Find all indicators associated with the last operational plan
      });

      for (const indicator of indicatorsToCopy) { // Copy each indicator to the new operational plan
        const indicatorData = indicator.toObject();
        delete indicatorData._id; // Remove the ID to create a new indicator
        delete indicatorData.evidence; // Remove the evidence field

        const newIndicator = new Indicator({ // Create a new indicator
          ...indicatorData,
          actual: 0, // Set the actual value to 0
          operationalPlanId: newOperationalPlan._id, // Associate the indicator with the new operational plan
        });

        await newIndicator.save(); // Save the new indicator to the database

        await Activity.findByIdAndUpdate( // Add the new indicator to the Activity's indicators_ListIDS
          indicator.activityId,
          { $push: { indicators_ListIDS: newIndicator._id } },
          { new: true }
        );
      }
    }

    // Add the new Operational Plan to the Strategic Plan's list
    strategicPlan.operationPlan_ListIDS.push(newOperationalPlan._id);

    await strategicPlan.save(); // Save the updated strategic plan

    res.send({
      message: "Operational Plan created successfully", // Send a success message
      id: newOperationalPlan._id,
    });
  } catch (err) {
    console.error("Error creating Operational Plan:", err);
    res.status(500).send("Error creating Operational Plan"); // Handle server error
  }
});

/**
 * Set an Operational Plan's active status to inactive
 * @param {String} id - ID of the operational plan
 * @returns {Object} - Updated operational plan or error message
 * @throws {Object} - Error message if operational plan not found or server error occurs
 */
router.patch("/inactivate/:id", async (req, res) => {
  try {
    // Set the active status of the operational plan to false
    const plan = await OperationalPlan.findByIdAndUpdate(
      req.params.id,
      { active: false }, // Set the active status to false
      { new: true } 
    );
    if (!plan) return res.status(404).send("Operational plan not found."); // If no operational plan is found, return an error
    res.send(plan);
  } catch (error) {
    res
      .status(500)
      .send("Server error while setting operational plan to inactive."); // Handle server error
  }
});

/**
 * Update an existing Operational Plan
 * @param {String} id - ID of the operational plan
 * @param {Object} req.body - Updated data for the operational plan
 * @returns {Object} - Updated operational plan data or error message
 * @throws {Object} - Error message if operational plan not found or server error occurs
 */
router.put("/update/:id", async (req, res) => {
  try {
    // Find the operational plan by ID and update it with the new data
    const updatedPlan = await OperationalPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPlan)
      return res.status(404).send("Operational plan not found."); // If no operational plan is found, return an error
    res.send(updatedPlan);
  } catch (error) {
    res.status(500).send("Server error while updating operational plan."); // Handle server error
  }
});

// Export the router
module.exports = router;
