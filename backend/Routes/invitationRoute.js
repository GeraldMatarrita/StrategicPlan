const router = require("express").Router();
const {
  StrategicPlan,
  validateStrategicPlan,
} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel
const { User, validateUser } = require("../Models/UserModel"); // Ajusta la ruta según la ubicación de tu archivo de modelo

/**
 * función que obtiene las invitaciones de un usuario por su ID
 * @param {String} userId - ID del usuario
 * @returns {Object} - Lista de invitaciones
 * @throws {Object} - Mensaje de error
 */
router.get("/UserInvitations/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({
      message: "User ID is required.",
    });
  }

  try {
    // Verificar si el usuario existe
    const user = await User.findById(userId).populate("invitations");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Crear un nuevo array para almacenar las invitaciones actualizadas
    const response = [];

    for (let i = 0; i < user.invitations.length; i++) {
      // Encuentra el plan asociado a la invitación
      const plan = await StrategicPlan.findById(user.invitations[i].planId);

      // Crear una nueva invitación con la propiedad planName agregada
      if (plan) {
        const updatedInvitation = {
          ...user.invitations[i]._doc, // Copia todas las propiedades existentes de la invitación
          planName: plan.name, // Agrega la nueva propiedad planName
        };

        // Agregar la invitación actualizada al array de respuestas
        response.push(updatedInvitation);
      }
    }

    // Enviar la respuesta con las invitaciones actualizadas
    res.status(200).json({
      invitations: response,
    });
  } catch (error) {
    console.error("Error getting invitations:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * función que crea una nueva invitación a un usuario por su ID la invitación se crea con el estado de pendiente al planId recibido
 * @param {String} userId - ID del usuario al que se invita
 * @param {String} planId - ID del plan estratégico al que se invita al usuario
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 */
router.post("/create", async (req, res) => {
  const { userId, planId } = req.body;

  if (!userId || !planId) {
    return res.status(400).json({
      message: "User ID and Plan ID are required.",
    });
  }

  try {
    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Verificar si el plan existe
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Strategic plan not found.",
      });
    }

    // Verificar si ya existe una invitación pendiente para este plan
    const existingInvitation = user.invitations.find(
      (inv) =>
        inv.planId.toString() === planId &&
        (inv.status === "pending" || inv.status === "accepted")
    );
    if (existingInvitation) {
      return res.status(400).json({
        message: "Invitation already exists.",
      });
    }

    // Añadir la invitación
    user.invitations.push({
      planId,
      status: "pending",
    });

    await user.save();

    res.status(200).json({
      message: "Invitation added successfully.",
    });
  } catch (error) {
    console.error("Error adding invitation:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * función que responde a una invitación con el estado de aceptado o rechazado tomando el userId, planId y decision
 * @param {String} userId - ID del usuario que responde a la invitación
 * @param {String} planId - ID del plan estratégico al que se responde la invitación
 * @param {Boolean} decision - Decisión del usuario, true para aceptar, false para rechazar
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 */
router.post("/response", async (req, res) => {
  const { userId, planId, decision } = req.body;

  if (!userId || !planId || decision === undefined) {
    return res.status(400).json({
      message: "User ID, desicion and Plan ID are required.",
    });
  }

  try {
    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Verificar si el plan existe
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Strategic plan not found.",
      });
    }

    // Verificar si existe una invitación pendiente para este plan
    const invitationIndex = user.invitations.findIndex(
      (inv) => inv.planId.toString() === planId && inv.status === "pending"
    );
    if (invitationIndex === -1) {
      return res.status(400).json({
        message: "Invitation not found or not pending.",
      });
    }

    // Actualizar el estado de la invitación
    user.invitations[invitationIndex].status = decision
      ? "accepted"
      : "declined";

    if (decision) {
      // Solo agregamos el plan si la decisión es aceptada
      if (!user.strategicPlans_ListIDS.includes(planId)) {
        user.strategicPlans_ListIDS.push(planId);
      }
      if (!plan.members_ListIDS.includes(userId)) {
        plan.members_ListIDS.push(userId);
      }
      // Guardar los cambios en el plan
      await plan.save();
    }
    const messageStatus = decision
      ? "Invitation accepted successfully."
      : "Invitation declined successfully.";

    await user.save();

    res.status(200).json({
      message: messageStatus,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
