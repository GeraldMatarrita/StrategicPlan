const router = require("express").Router();
const mongoose = require("mongoose");

const {
  StrategicPlan,
  validateStrategicPlan
} = require("../Models/StrategicPlanModel"); // Imports the StrategicPlanModel
const { User, validateUser } = require("../Models/UserModel"); // Adjust the path based on your model file location

const SWOT = require("../Models/SwotModel");
const CAME = require("../Models/CameModel");

/**
 * Function that retrieves all strategic plans
 * @returns {Object} - List of strategic plans
 * @throws {Object} - Error message
 */
router.get("/AllStrategicPlans", async (req, res) => {
  try {
    // Find all strategic plans
    const strategicPlans = await StrategicPlan.find();
    res.json(strategicPlans); // Return the list of strategic plans
  } catch (error) {
    console.error(
      "Error querying the StrategicPlanModel collection in MongoDB:",
      error
    );
    res.status(500).json({
      error: "Error querying the StrategicPlanModel collection in MongoDB", // Handle server error
    });
  }
});

/**
 * Function that retrieves a strategic plan by its ID
 * @param {String} id - Strategic plan ID
 * @returns {Object} - Strategic plan
 * @throws {Object} - Error message
 */
router.get("/ById/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameter
    const strategicPlan = await StrategicPlan.findById(id).populate( // Find the strategic plan by ID and populate the members and operationPlan_ListIDS fields
      "members_ListIDS"
    ).populate("operationPlan_ListIDS");

    if (!strategicPlan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel not found" }); // If no strategic plan is found, return an error
    }
    res.json(strategicPlan);
  } catch (error) {
    console.error(
      "Error querying the StrategicPlanModel collection in MongoDB:",
      error
    );
    res.status(500).json({
      message: "Error querying the StrategicPlanModel collection in MongoDB", // Handle server error
    });
  }
});

/**
 * Function that retrieves strategic plans of a user by their user ID
 * @param {String} userId - User ID to query their strategic plans
 * @returns {Object} - List of user's strategic plans
 * @throws {Object} - Error message
 */
router.get("/ByUserID/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the URL parameter
    const user = await User.findById(userId).populate("strategicPlans_ListIDS"); // Find the user by ID and populate the strategicPlans_ListIDS field
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // If no user is found, return an error
    }
    res.json(user.strategicPlans_ListIDS);
  } catch (error) {
    console.error("Error querying the user's plans:", error); 
    res
      .status(500)
      .json({ message: "Error querying the user's plans" }); // Handle server error
  }
});

/**
 * Function that retrieves the active strategic plans of a user
 * @param {String} userId - User ID to query their active plans
 * @returns {Object} - List of user's active strategic plans
 * @throws {Object} - Error message
 */
router.get("/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the URL parameter
    const currentDate = new Date(); // Get the current date

    // Find the user and get the IDs of their strategic plans
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // If no user is found, return an error
    }

    // Filter active plans based on the current date
    const activePlans = await StrategicPlan.find({ // Find the active plans based on the user's strategicPlans_ListIDS, start date, and end date
      _id: { $in: user.strategicPlans_ListIDS },
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    res.json(activePlans); // Return the list of active plans
  } catch (error) {
    console.error("Error querying the user's active plans:", error);
    res.status(500).json({
      message: "Error querying the user's active plans",
    });
  }
});

/**
 * Function that retrieves the completed strategic plans of a user
 * @param {String} userId - User ID to query their completed plans
 * @returns {Object} - List of user's completed strategic plans
 * @throws {Object} - Error message
 */
router.get("/finished/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the URL parameter
    const currentDate = new Date(); // Get the current date

    // Find the user and get the IDs of their strategic plans
    const user = await User.findById(userId).populate("strategicPlans_ListIDS"); // Find the user by ID and populate the strategicPlans_ListIDS field
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // If no user is found, return an error
    }

    // Filter completed plans based on the current date 
    const finishedPlans = await StrategicPlan.find({ // Find the completed plans based on the user's strategicPlans_ListIDS and end date
      _id: { $in: user.strategicPlans_ListIDS },
      endDate: { $lt: currentDate },
    });

    res.json(finishedPlans); // Return the list of completed plans
  } catch (error) {
    console.error(
      "Error querying the user's completed plans:",
      error
    );
    res.status(500).json({
      message: "Error querying the user's completed plans",
    });
  }
});

/**
 * Function that removes a user from a strategic plan. It removes the user from the plan's member list, deletes invitations to that plan,
 * and removes the plan from the user's plan list.
 * @param {String} userId - ID of the user to be removed from the plan
 * @param {String} planId - ID of the strategic plan
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.post("/out", async (req, res) => {
  try {
    const { userId, planId } = req.body; // Get the user and plan IDs

    // Check if the plan exists before removing
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel not found" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the plan from the user's plan list
    await User.findByIdAndUpdate(userId, {
      $pull: { strategicPlans_ListIDS: planId },
    });

    // Remove the user from the plan's member list
    await StrategicPlan.findByIdAndUpdate(
      planId,
      { $pull: { members_ListIDS: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    );

    // Remove invitations for the user to the plan
    await User.updateOne(
      { _id: userId },
      { $pull: { invitations: { planId: planId } } }
    );

    // Confirm the removal
    res
      .status(200)
      .json({ message: "User successfully removed from the plan" });
  } catch (error) {
    console.error("Error removing user from the plan:", error);
    res.status(500).json({ message: "Error removing user from the plan" });
  }
});

/**
 * Function that creates a new strategic plan and associates it with a user.
 * @param {Object} req.body - Strategic plan to create.
 * @param {Object} req.params.userId - ID of the user the plan will be associated with.
 * @returns {Object} - Confirmation message.
 * @throws {Object} - Error message.
 */
router.post("/create/:userId", async (req, res) => {
  try {
    // Validate the input data
    const { error } = validateStrategicPlan(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Invalid data" });
    }

    // Check if the user exists
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new strategic plan with empty SWOT and CAME
    const newStrategicPlan = new StrategicPlan(req.body);
    
    // Create a new SWOT and CAME
    const newSWOT = new SWOT({
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
    });
    const newCAME = new CAME({
        correct: [],
        afront: [],
        maintain: [],
        explore: []
    });
    
    await newSWOT.save(); // Save the SWOT
    await newCAME.save(); // Save the CAME
    newStrategicPlan.SWOT = newSWOT._id; // Associate the SWOT and CAME with the strategic plan
    newStrategicPlan.CAME = newCAME._id; // Associate the SWOT and CAME with the strategic plan
    await newStrategicPlan.save(); // Save the strategic plan

    // Associate the plan with the user
    await User.updateOne(
      { _id: userId },
      { $push: { strategicPlans_ListIDS: newStrategicPlan._id } }
    );

    // Associate the user with the plan
    await StrategicPlan.updateOne(
      { _id: newStrategicPlan._id },
      { $push: { members_ListIDS: new mongoose.Types.ObjectId(userId) } }
    );

    // Respond with a success message
    res.status(201).json({
      message: `Strategic plan created successfully`,
    });
  } catch (error) {
    console.error("Error creating the strategic plan:", error);
    res
      .status(500)
      .json({ message: "Error creating the strategic plan" });
  }
});

/**
 * Function that updates a strategic plan by its ID
 * @param {String} id - ID of the strategic plan
 * @param req.body) data to update the strategic plan
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.put("/updateObjectives/:id", async (req, res) => {
  try {
    const { objective_ListIDS } = req.body; // Get the objective list IDs from the request body

    if (!Array.isArray(objective_ListIDS) || objective_ListIDS.length === 0) { // Check if the objective list IDs are provided
      return res.status(400).json({ message: "Objective List IDs must be provided" }); // If not, return an error
    }

    
    const updatedStrategicPlan = await StrategicPlan.findByIdAndUpdate( // Find the strategic plan by ID and update the objective list IDs
      req.params.id,
      { objective_ListIDS }, 
      { new: true, runValidators: true }
    );

    if (!updatedStrategicPlan) {
      return res.status(404).json({ message: "StrategicPlanModel not found" }); // If no strategic plan is found, return an error
    }

    res.json({
      message: "Strategic Plan successfully updated", // Return a success message
      data: updatedStrategicPlan,
    });
  } catch (error) {
    console.error(
      "Error updating the entry in the Strategic Plan collection in MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error updating the entry in the StrategicPlan collection in MongoDB", // Handle server error
    });
  }
});

/**
 * Function that updates a strategic plan by its ID
 * @param {String} id - ID of the strategic plan
 * @param req.body) data to update the strategic plan
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.put("/update/:id", async (req, res) => {
  try {
    const { error } = validateStrategicPlan(req.body); // Validate the request body
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message || "Invalid data" }); // If validation fails, return an error

    const updatedStrategicPlan = await StrategicPlan.findByIdAndUpdate( // Find the strategic plan by ID and update it with the new data
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStrategicPlan) { // If no strategic plan is found, return an error
      return res
        .status(404)
        .json({ message: "Strategic Plan not found" });
    }

    res.json({
      message: "Strategic Plan updated successfully", // Return a success message
      data: updatedStrategicPlan,
    });
  } catch (error) {
    console.error(
      "Error updating the entry in the StrategicPlanModel collection in MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error updating the entry in the StrategicPlanModel collection in MongoDB", // Handle server error
    });
  }
});


// Export the router
module.exports = router;
