const router = require("express").Router();
const {
  ObjectiveModel,
  validateObjective,
} = require("../Models/ObjectiveModel");
const { User, validateUser } = require("../Models/UserModel");
const {
  StrategicPlan,
  validateStrategicPlan,
} = require("../Models/StrategicPlanModel");

router.get("/getObjective/:objectiveId", async (req, res) => {
  try {
    const { objectiveId } = req.params;

    const objective = await ObjectiveModel.findById(objectiveId).populate(
      "responsible"
    );

    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.",
      });
    }

    res.status(200).json(objective);
  } catch (error) {
    console.error("Error getting objective:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Function that retrieves all objectives of a strategic plan
 * @param {String} planId - ID of the strategic plan
 * @returns {Object} - List of objectives
 * @throws {Object} - Error message
 */
router.get("/getPlanObjectives/:planId", async (req, res) => {
  try {
    const { planId } = req.params;

    // Search for the strategic plan
    const strategicPlan = await StrategicPlan.findById(planId);
    if (!strategicPlan) {
      return res.status(404).json({
        message: "Strategic Plan not found.",
      });
    }

    // Search for the objectives of the strategic plan
    const objectives = await ObjectiveModel.find({
      _id: { $in: strategicPlan.objective_ListIDS },
    }).populate("responsible");

    res.status(200).json(objectives);
  } catch (error) {
    console.error("Error getting plan objectives:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Function that creates a new objective
 * @param {Object} req - Request object
 * @param {Object} planId - ID of the strategic plan
 * @returns {Object} - Success or error message
 * @throws {Object} - Error message
 */
router.post("/create/:planId", async (req, res) => {
  try {
    const { error } = validateObjective(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Invalid Data" });
    }

    const { planId } = req.params;

    // Search for the strategic plan
    const strategicPlan = await StrategicPlan.findById(planId);
    if (!strategicPlan) {
      return res.status(404).json({
        message: "Strategic Plan not found.",
      });
    }

    // Create a new objective
    const newObjective = new ObjectiveModel(req.body);
    await newObjective.save();

    // Add the objective to the strategic plan
    await StrategicPlan.updateOne(
      { _id: planId },
      { $push: { objective_ListIDS: newObjective._id } }
    );

    res.status(201).json({
      message: "Objective created successfully.",
    });
  } catch (error) {
    console.error("Error creating objective:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Function that updates an objective
 * @param {Object} req - Request object
 * @param {String} objectiveId - ID of the objective
 * @returns {Object} - Success or error message
 * @throws {Object} - Error message
 */
router.put("/update/:objectiveId", async (req, res) => {
  try {
    const { objectiveId } = req.params;

    // Search for the objective
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.",
      });
    }

    // Update the objective
    await ObjectiveModel.updateOne({ _id: objectiveId }, req.body);

    res.status(200).json({
      message: "Objective updated successfully.",
    });
  } catch (error) {
    console.error("Error updating objective:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Function that deletes an objective
 * @param {String} objectiveId - ID of the objective
 * @returns {Object} - Success or error message
 * @throws {Object} - Error message
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the objective by its ID
    const deletedObjective = await ObjectiveModel.findByIdAndDelete(id);

    if (!deletedObjective) {
      return res.status(404).json({ message: "Objective not found" });
    }

    res.status(200).json({
      message: "Objective successfully deleted",
      data: deletedObjective,
    });
  } catch (error) {
    console.error("Error deleting the objective:", error);
    res.status(500).json({
      message: "Error deleting the objective from the database",
    });
  }
});

module.exports = router;
