const router = require("express").Router();
const { GoalModel, validateGoal } = require("../Models/GoalModel");
const { User, validateUser } = require("../Models/UserModel");
const {
  StrategicPlan,
  validateStrategicPlan,
} = require("../Models/StrategicPlanModel");
const {
  ObjectiveModel,
  validateObjective,
} = require("../Models/ObjectiveModel");

/**
 * funcion que trae todos los goals de un objetivo
 * @param {String} objectiveId - ID del objetivo
 * @returns {Object} - Lista de goals
 * @throws {Object} - Mensaje de error
 */
router.get("/getObjectiveGoals/:objectiveId", async (req, res) => {
  try {
    const { objectiveId } = req.params;

    // Buscar el objetivo
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.",
      });
    }

    // Buscar los goals del objetivo
    const goals = await GoalModel.find({
      _id: { $in: objective.goals_ListIDS },
    });

    res.status(200).json(goals);
  } catch (error) {
    console.error("Error getting objective goals:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * función para traer todos los goals de un plan estratégico
 * @param {String} planId - ID del plan estratégico
 * @returns {Object} - Lista de goals
 * @throws {Object} - Mensaje de error
 */
router.get("/getPlanGoals/:planId", async (req, res) => {
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

    // Extraer todos los IDs de goals de cada objective
    const goalIds = objectives.flatMap((objective) => objective.goals_ListIDS);

    // Buscar los goals de los objetivos del plan estratégico
    const goals = await GoalModel.find({
      _id: { $in: goalIds },
    });

    res.status(200).json(goals);
  } catch (error) {
    console.error("Error getting plan goals:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * función para crear un goal y asociarlo a un objetivo
 * @param {String} objectiveId - ID del objetivo
 * @param {Object} req - Datos del goal
 * @returns {Object} - Mensaje de éxito o error
 * @throws {Object} - Mensaje de error
 */
router.post("/create/:objectiveId", async (req, res) => {
  try {
    const { error } = validateGoal(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });
    }

    const { objectiveId } = req.params;

    // Buscar el objetivo
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      return res.status(404).json({
        message: "Objective not found.",
      });
    }

    // Inicializar goal_ListIDS si no está definido
    if (!objective.goals_ListIDS) {
      objective.goals_ListIDS = [];
    }

    // Crear un nuevo goal
    const newGoal = new GoalModel(req.body);
    await newGoal.save();

    // Asociar el goal al objetivo
    objective.goals_ListIDS.push(newGoal._id);
    //aumentar el contador de totalGoals
    objective.totalGoals += 1;
    await objective.save();

    res.status(201).json({
      message: "Goal created successfully.",
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * función que actualiza una meta (goal)
 * @param {String} goalId - ID de la meta
 * @returns {Object} - Mensaje de éxito o error
 * @throws {Object} - Mensaje de error
 */
router.put("/update/:goalId", async (req, res) => {
  try {
    // Validar los datos de la meta que se quieren actualizar
    const { error } = validateGoal(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });
    }

    const { goalId } = req.params;

    // Buscar la meta (goal) por su ID
    const goal = await GoalModel.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        message: "Goal not found.",
      });
    }

    // Actualizar la meta con los nuevos datos
    await GoalModel.updateOne({ _id: goalId }, req.body);

    // Si se modifican actividades completadas o totales, también puede ser necesario actualizar el objetivo padre
    const { totalActivities, completedActivities } = req.body;
    if (totalActivities !== undefined || completedActivities !== undefined) {
      // Encontrar el objetivo asociado a la meta
      const objective = await ObjectiveModel.findOne({ goals_ListIDS: goalId });
      if (objective) {
        // Actualizar el total y las actividades completadas
        const updatedObjective = {
          totalGoals: objective.goals_ListIDS.length,
          completedGoals: await GoalModel.countDocuments({
            _id: { $in: objective.goals_ListIDS },
            completedActivities: { $gte: totalActivities },
          }),
        };

        // Aplicar la actualización al objetivo
        await ObjectiveModel.updateOne({ _id: objective._id }, updatedObjective);
      }
    }

    res.status(200).json({
      message: "Goal updated successfully.",
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Función para eliminar un goal y actualizar la lista de goals en el objetivo
 * @param {String} goalId - ID de la meta (goal)
 * @returns {Object} - Mensaje de éxito o error
 * @throws {Object} - Mensaje de error
 */
router.delete("/delete/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params;
    
    // Eliminar el goal del sistema
    await GoalModel.findByIdAndDelete(goalId);

    res.status(200).json({
      message: "Goal deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
