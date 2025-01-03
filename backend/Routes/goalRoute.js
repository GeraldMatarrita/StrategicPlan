const router = require("express").Router();
const { Goal, validateGoal } = require("../Models/GoalModel");
const { StrategicPlan } = require("../Models/StrategicPlanModel");
const { ObjectiveModel } = require("../Models/ObjectiveModel");

/**
 * Function that retrieves all goals of an objective
 * @param {String} objectiveId - Objective ID
 * @returns {Object} - List of goals
 * @throws {Object} - Error message
 */
router.get("/getObjectiveGoals/:objectiveId", async (req, res) => {
  try {
    const { objectiveId } = req.params;

    // Find the objective
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.",
      });
    }

    // Find the goals of the objective and populate the Activity and Indicator fields
    const goals = await Goal.find({
      _id: { $in: objective.goals_ListIDS },
    }).populate("Activity_ListIDS");

    res.status(200).json(goals); // Return the list of goals
  } catch (error) {
    console.error("Error getting objective goals:", error);
    res.status(500).json({
      message: "Internal Server Error", // Handle server error
    });
  }
});

/**
 * Function to retrieve all goals of a strategic plan
 * @param {String} planId - Strategic plan ID
 * @returns {Object} - List of goals
 * @throws {Object} - Error message
 */
router.get("/getPlanGoals/:planId", async (req, res) => {
  try {
    const { planId } = req.params;

    // Find the strategic plan
    const strategicPlan = await StrategicPlan.findById(planId);
    if (!strategicPlan) {
      return res.status(404).json({
        message: "Strategic Plan not found.",
      });
    }

    // Find the objectives of the strategic plan
    const objectives = await ObjectiveModel.find({
      _id: { $in: strategicPlan.objective_ListIDS },
    });

    // Extract all goal IDs from each objective
    const goalIds = objectives.flatMap((objective) => objective.goals_ListIDS);

    // Find the goals of the strategic plan's objectives
    const goals = await Goal.find({
      _id: { $in: goalIds },
    });

    res.status(200).json(goals); // Return the list of goals
  } catch (error) {
    console.error("Error getting plan goals:", error);
    res.status(500).json({
      message: "Internal Server Error", // Handle server error
    });
  }
});

/**
 * Function to create a goal and associate it with an objective
 * @param {String} objectiveId - Objective ID
 * @param {Object} req - Goal data
 * @returns {Object} - Success or error message
 * @throws {Object} - Error message
 */
router.post("/create/:objectiveId", async (req, res) => {
  try {
    const { error } = validateGoal(req.body); // Validate the goal data
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Invalid data" }); // If validation fails, return an error
    }

    const { objectiveId } = req.params; // Get the objective ID from the request parameters

    // Find the objective
    const objective = await ObjectiveModel.findById(objectiveId); // Find the objective by ID
    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.", // If no objective is found, return an error
      });
    }

    // Initialize goals_ListIDS if undefined
    if (!objective.goals_ListIDS) {
      objective.goals_ListIDS = [];
    }

    // Create a new goal
    const newGoal = new Goal(req.body);
    await newGoal.save();

    // Associate the goal with the objective
    objective.goals_ListIDS.push(newGoal._id);
    // Increment the totalGoals counter
    objective.totalGoals += 1;
    await objective.save();

    res.status(201).json({
      message: "Goal created successfully.", // Return a success message
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      message: "Internal Server Error", // Handle server
    });
  }
});

/**
 * Function to update a goal
 * @param {String} goalId - Goal ID
 * @returns {Object} - Success or error message
 * @throws {Object} - Error message
 */
router.put("/update/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params; // Get the goal ID from the request parameters

    // Find the goal by its ID
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        message: "Goal not found.",
      });
    }

    // Update the goal with new data
    await Goal.updateOne({ _id: goalId }, req.body);

    // If total or completed activities are modified, it may also be necessary to update the parent objective
    const { totalActivities, completedActivities } = req.body;
    if (totalActivities !== undefined || completedActivities !== undefined) {
      // Find the objective associated with the goal
      const objective = await ObjectiveModel.findOne({ goals_ListIDS: goalId });
      if (objective) {
        // Update the total and completed activities
        const updatedObjective = {
          totalGoals: objective.goals_ListIDS.length,
          completedGoals: await Goal.countDocuments({
            _id: { $in: objective.goals_ListIDS },
            completedActivities: { $gte: totalActivities },
          }),
        };

        // Apply the update to the objective
        await ObjectiveModel.updateOne(
          { _id: objective._id },
          updatedObjective
        );
      }
    }

    res.status(200).json({
      message: "Goal updated successfully.", // Return a success message
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({
      message: "Internal Server Error", // Handle server error
    });
  }
});

/**
 * Function to delete a goal and update the objective's goal list
 * @param {String} goalId - Goal ID
 * @returns {Object} - Success or error message
 * @throws {Object} - Error message
 */
router.delete("/delete/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params; // Get the goal ID from the request parameters

    // Delete the goal from the system
    await Goal.findByIdAndDelete(goalId);

    res.status(200).json({
      message: "Goal deleted successfully.", // Return a success message
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      message: "Internal Server Error", // Handle server error
    });
  }
});

// Export the router
module.exports = router;
