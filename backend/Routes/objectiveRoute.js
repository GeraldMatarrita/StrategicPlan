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

/**
 * Function that retrieves all objectives of a user
 * @param {String} userId - ID of the user
 * @returns {Object} - List of objectives
 * @throws {Object} - Error message
 */
router.get("/getObjective/:objectiveId", async (req, res) => {
  try {
    const { objectiveId } = req.params; // Get the objective ID from the request parameters

    // Find the objective by ID and populate the responsible field
    const objective = await ObjectiveModel.findById(objectiveId).populate(
      "responsible"
    );

    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.", // If no objective is found, return an error
      });
    }

    res.status(200).json(objective); // Send the objective object
  } catch (error) {
    console.error("Error getting objective:", error);
    res.status(500).json({
      message: "Internal Server Error", // Handle server error
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
    const { planId } = req.params;  // Get the strategic plan ID from the request parameters

    // Search for the strategic plan
    const strategicPlan = await StrategicPlan.findById(planId);
    if (!strategicPlan) {
      return res.status(404).json({
        message: "Strategic Plan not found.", // If no strategic plan is found, return an error
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
      message: "Internal Server Error", // Handle server error
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
    const { error } = validateObjective(req.body); // Validate the request body
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Invalid Data" }); // If validation fails, return an error
    }

    const { planId } = req.params; // Get the strategic plan ID from the request parameters

    // Search for the strategic plan
    const strategicPlan = await StrategicPlan.findById(planId); // Find the strategic plan by ID
    if (!strategicPlan) {
      return res.status(404).json({
        message: "Strategic Plan not found.", // If no strategic plan is found, return
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
      message: "Objective created successfully.", // Send a success message
    });
  } catch (error) {
    console.error("Error creating objective:", error);
    res.status(500).json({
      message: "Internal Server Error", // Handle server error
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
    const { objectiveId } = req.params; // Get the objective ID from the request parameters

    // Search for the objective
    const objective = await ObjectiveModel.findById(objectiveId); 
    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.", // If no objective is found, return an error
      });
    }

    // Update the objective
    await ObjectiveModel.updateOne({ _id: objectiveId }, req.body);

    res.status(200).json({
      message: "Objective updated successfully.", // Send a success message
    });
  } catch (error) {
    console.error("Error updating objective:", error); 
    res.status(500).json({
      message: "Internal Server Error", // Handle server error
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
    const { id } = req.params; // Get the objective ID from the request

    // Find and delete the objective by its ID
    const deletedObjective = await ObjectiveModel.findByIdAndDelete(id);

    if (!deletedObjective) {
      return res.status(404).json({ message: "Objective not found" }); // If no objective is found, return an error
    }

    res.status(200).json({
      message: "Objective successfully deleted", // Send a success message
      data: deletedObjective,
    });
  } catch (error) {
    console.error("Error deleting the objective:", error);
    res.status(500).json({
      message: "Error deleting the objective from the database", // Handle server error
    });
  }
});

// Export the router
module.exports = router;
