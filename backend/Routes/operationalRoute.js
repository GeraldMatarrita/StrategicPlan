const express = require("express");
const router = express.Router();
const { OperationalPlan, validateOperationalPlan } = require("../Models/OperationalModel");
const { StrategicPlan } = require("../Models/StrategicPlanModel");

// Get the active Operational Plan (active: true)
router.get("/active", async (req, res) => {
  try {
    const activePlan = await OperationalPlan.findOne({ active: true });
    if (!activePlan) return res.status(404).send("No active operational plan found.");
    res.send(activePlan);
  } catch (error) {
    res.status(500).send("Server error while fetching active operational plan.");
  }
});

// Get all inactive Operational Plans (active: false)
router.get("/getOperationalPlans", async (req, res) => {
  try {
    const inactivePlans = await OperationalPlan.find();
    res.send(inactivePlans);
  } catch (error) {
    res.status(500).send("Server error while fetching inactive operational plans.");
  }
});

// Create a new Operational Plan
router.post("/create/:strategicPlanId", async (req, res) => {
  const { error } = validateOperationalPlan(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // Set any existing active Operational Plan to inactive
    await OperationalPlan.updateMany({ active: true }, { active: false });

    // Create and save the new Operational Plan
    const newPlan = new OperationalPlan(req.body);
    await newPlan.save();

    // Update the Strategic Plan by adding the new Operational Plan ID to operationPlan_ListIDS
    const { strategicPlanId } = req.params;
    const strategicPlan = await StrategicPlan.findByIdAndUpdate(
      strategicPlanId,
      { $push: { operationPlan_ListIDS: newPlan._id } },
      { new: true }
    );

    if (!strategicPlan) {
      // If the strategic plan does not exist, delete the new operational plan and return an error
      await OperationalPlan.findByIdAndDelete(newPlan._id);
      return res.status(404).send("Strategic Plan not found.");
    }

    res.send(newPlan);
  } catch (error) {
    console.error("Error while creating operational plan:", error);
    res.status(500).send("Server error while creating operational plan.");
  }
});

// Set an Operational Plan to inactive
router.patch("/inactivate/:id", async (req, res) => {
  try {
    const plan = await OperationalPlan.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!plan) return res.status(404).send("Operational plan not found.");
    res.send(plan);
  } catch (error) {
    res.status(500).send("Server error while setting operational plan to inactive.");
  }
});

// Update an Operational Plan
router.put("/update/:id", async (req, res) => {
  try {
    const updatedPlan = await OperationalPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPlan) return res.status(404).send("Operational plan not found.");
    res.send(updatedPlan);
  } catch (error) {
    res.status(500).send("Server error while updating operational plan.");
  }
});

module.exports = router;
