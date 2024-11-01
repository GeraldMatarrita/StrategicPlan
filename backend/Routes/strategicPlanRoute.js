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
    const strategicPlans = await StrategicPlan.find();
    res.json(strategicPlans);
  } catch (error) {
    console.error(
      "Error querying the StrategicPlanModel collection in MongoDB:",
      error
    );
    res.status(500).json({
      error: "Error querying the StrategicPlanModel collection in MongoDB",
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
    const strategicPlan = await StrategicPlan.findById(id).populate(
      "members_ListIDS"
    ).populate("operationPlan_ListIDS");

    if (!strategicPlan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel not found" });
    }
    res.json(strategicPlan);
  } catch (error) {
    console.error(
      "Error querying the StrategicPlanModel collection in MongoDB:",
      error
    );
    res.status(500).json({
      message: "Error querying the StrategicPlanModel collection in MongoDB",
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
    const { userId } = req.params;
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.strategicPlans_ListIDS);
  } catch (error) {
    console.error("Error querying the user's plans:", error);
    res
      .status(500)
      .json({ message: "Error querying the user's plans" });
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
    const { userId } = req.params;
    const currentDate = new Date();

    // Find the user and get the IDs of their strategic plans
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter active plans based on the current date
    const activePlans = await StrategicPlan.find({
      _id: { $in: user.strategicPlans_ListIDS },
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    res.json(activePlans);
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
    const { userId } = req.params;
    const currentDate = new Date();

    // Find the user and get the IDs of their strategic plans
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter completed plans based on the current date
    const finishedPlans = await StrategicPlan.find({
      _id: { $in: user.strategicPlans_ListIDS },
      endDate: { $lt: currentDate },
    });

    res.json(finishedPlans);
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
    
    await newSWOT.save();
    await newCAME.save();
    newStrategicPlan.SWOT = newSWOT._id;
    newStrategicPlan.CAME = newCAME._id;
    await newStrategicPlan.save();

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
    // Extraer el ID de los objetivos desde el cuerpo de la solicitud
    const { objective_ListIDS } = req.body;

    // Verificar que se pasen los IDs correctos
    if (!Array.isArray(objective_ListIDS) || objective_ListIDS.length === 0) {
      return res.status(400).json({ message: "Objective List IDs must be provided" });
    }

    // Actualizar solo el campo objective_ListIDS
    const updatedStrategicPlan = await StrategicPlan.findByIdAndUpdate(
      req.params.id,
      { objective_ListIDS }, // Solo actualizar objective_ListIDS
      { new: true, runValidators: true }
    );

    if (!updatedStrategicPlan) {
      return res.status(404).json({ message: "StrategicPlanModel not found" });
    }

    res.json({
      message: "Strategic Plan successfully updated",
      data: updatedStrategicPlan,
    });
  } catch (error) {
    console.error(
      "Error updating the entry in the Strategic Plan collection in MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error updating the entry in the StrategicPlan collection in MongoDB",
    });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { error } = validateStrategicPlan(req.body);
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message || "Invalid data" });

    const updatedStrategicPlan = await StrategicPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStrategicPlan) {
      return res
        .status(404)
        .json({ message: "Strategic Plan not found" });
    }

    res.json({
      message: "Strategic Plan updated successfully",
      data: updatedStrategicPlan,
    });
  } catch (error) {
    console.error(
      "Error updating the entry in the StrategicPlanModel collection in MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error updating the entry in the StrategicPlanModel collection in MongoDB",
    });
  }
});

module.exports = router;
