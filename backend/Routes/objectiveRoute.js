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
 * funcion que trae todos los objetivos de un plan estratégico
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
    });

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
        .json({ message: error.details[0].message || "Datos inválidos" });
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

module.exports = router;
