const router = require("express").Router();
const mongoose = require("mongoose");

const {
  StrategicPlan,
  validateStrategicPlan,
} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel
const { User, validateUser } = require("../Models/UserModel"); // Ajusta la ruta según la ubicación de tu archivo de modelo

/**
 * función que obtiene todos los planes estratégicos
 * @returns {Object} - Lista de planes estratégicos
 * @throws {Object} - Mensaje de error
 */
router.get("/", async (req, res) => {
  try {
    const strategicPlans = await StrategicPlan.find();
    res.json(strategicPlans);
  } catch (error) {
    console.error(
      "Error al consultar la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      error: "Error al consultar la colección StrategicPlanModel en MongoDB",
    });
  }
});

/**
 * función que obtiene un plan estratégico por su ID
 * @param {String} id - ID del plan estratégico
 * @returns {Object} - Plan estratégico
 * @throws {Object} - Mensaje de error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del parámetro de la URL
    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }
    res.json(strategicPlan);
  } catch (error) {
    console.error(
      "Error al consultar la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message: "Error al consultar la colección StrategicPlanModel en MongoDB",
    });
  }
});

/**
 * función que obtiene los planes estratégicos de un usuario por medio del ID del usuario
 * @param {String} userId - ID del usuario a consultar sus planes estratégicos
 * @returns {Object} - Lista de planes estratégicos del usuario
 * @throws {Object} - Mensaje de error
 */
router.get("/plans-to-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user.strategicPlans_ListIDS);
  } catch (error) {
    console.error("Error al consultar los planes del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al consultar los planes del usuario" });
  }
});

/**
 * Función que crea un nuevo plan estratégico y lo asocia a un usuario.
 * @param {Object} req.body - Plan estratégico a crear.
 * @param {Object} req.params.userId - ID del usuario al que se asociará el plan.
 * @returns {Object} - Mensaje de confirmación.
 * @throws {Object} - Mensaje de error.
 */
router.post("/:userId", async (req, res) => {
  try {
    console.log("req.body", req.body);
    // Validar los datos de entrada
    const { error } = validateStrategicPlan(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });
    }

    // Verificar si el usuario existe
    const { userId } = req.params;
    console.log("userId", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crear un nuevo plan estratégico
    const newStrategicPlan = new StrategicPlan(req.body);
    await newStrategicPlan.save();

    // Asociar el plan al usuario
    await User.updateOne(
      { _id: userId },
      { $push: { strategicPlans_ListIDS: newStrategicPlan._id } }
    );

    // Asociar el usuario al plan
    await StrategicPlan.updateOne(
      { _id: newStrategicPlan._id },
      { $push: { members_ListIDS: new mongoose.Types.ObjectId(userId) } }
    );

    // Responder con un mensaje de éxito
    res.status(201).json({
      message: `Se creó correctamente el plan estratégico y se asoció al usuario ${user.name}.`,
    });
  } catch (error) {
    console.error(
      "Error al guardar la entrada en la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al guardar la entrada en la colección StrategicPlanModel en MongoDB.",
    });
  }
});

/**
 * función que sacar un usuario de un plan estratégico lo saca de la lista de miembros del plan, elimina las invitaciones a ese plan
 * y elimina el plan de la lista de planes del usuario
 * @param {String} userId - ID del usuario a eliminar del plan
 * @param {String} planId - ID del plan estratégico
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 */
router.post("/out", async (req, res) => {
  try {
    const { userId, planId } = req.body; // Obtener el ID del usuario y del plan

    // Verificar si el plan existe antes de eliminar
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el plan de la lista de planes del usuario
    await User.findByIdAndUpdate(userId, {
      $pull: { strategicPlans_ListIDS: planId },
    });

    // Eliminar el usuario de la lista de miembros del plan
    await StrategicPlan.findByIdAndUpdate(planId, {
      $pull: { members_ListIDS: { userId: userId } },
    });

    // Eliminar las invitaciones del usuario para el plan
    await User.updateOne(
      { _id: userId },
      { $pull: { invitations: { planId: planId } } }
    );

    // Confirmar la eliminación
    res
      .status(200)
      .json({ message: "Usuario eliminado del plan exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el usuario del plan:", error);
    res.status(500).json({ message: "Error al eliminar el usuario del plan" });
  }
});

/**
 * función que actualiza un plan estratégico por su ID
 * @param {String} id - ID del plan estratégico
 * @param req.body) datos a actualizar del plan estratégico
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 * */
router.put("/:id", async (req, res) => {
  try {
    const { error } = validateStrategicPlan(req.body);
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });

    const updatedStrategicPlan = await StrategicPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStrategicPlan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }

    res.json({
      message: "StrategicPlanModel actualizado correctamente",
      data: updatedStrategicPlan,
    });
  } catch (error) {
    console.error(
      "Error al actualizar la entrada en la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al actualizar la entrada en la colección StrategicPlanModel en MongoDB",
    });
  }
});

module.exports = router;
