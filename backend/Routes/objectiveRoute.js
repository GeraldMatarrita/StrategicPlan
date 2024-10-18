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
 * función que trae todos los objetivos de un plan estratégico
 * @param {String} planId - ID del plan estratégico
 * @returns {Object} - Lista de objetivos
 * @throws {Object} - Mensaje de error
 */
router.get("/getPlanObjectives/:planId", async (req, res) => {
  try {
    const { planId } = req.params;

    // Buscar el plan estratégico
    const strategicPlan = await StrategicPlan.findById(planId);
    if (!strategicPlan) {
      return res.status(404).json({
        message: "Strategic Plan not found.",
      });
    }

    // Buscar los objetivos del plan estratégico
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
 * función que crea un nuevo objetivo
 * @param {Object} req - Request object
 * @param {Object} planId - ID del plan estratégico del plan
 * @returns {Object} - Mensaje de éxito o error
 * @throws {Object} - Mensaje de error
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

    // Buscar el plan estratégico
    const strategicPlan = await StrategicPlan.findById(planId);
    if (!strategicPlan) {
      return res.status(404).json({
        message: "Strategic Plan not found.",
      });
    }

    // Crear un nuevo objetivo
    const newObjective = new ObjectiveModel(req.body);
    await newObjective.save();

    // Agregar el objetivo al plan estratégico
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
 * función que actualiza un objetivo
 * @param {Object} req - Request object
 * @param {String} objectiveId - ID del objetivo
 * @returns {Object} - Mensaje de éxito o error
 * @throws {Object} - Mensaje de error
 */
router.put("/update/:objectiveId", async (req, res) => {
  try {
    const { objectiveId } = req.params;

    // Buscar el objetivo
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.",
      });
    }

    // Actualizar el objetivo
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
 * función que elimina un objetivo
 * @param {String} objectiveId - ID del objetivo
 * @returns {Object} - Mensaje de éxito o error
 * @throws {Object} - Mensaje de error
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Busca y elimina el objetivo por su ID
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
