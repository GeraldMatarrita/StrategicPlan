const router = require("express").Router();
const {
  StrategicPlan,
  validateStrategicPlan,
} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel
const { User, validateUser } = require("../Models/UserModel"); // Ajusta la ruta según la ubicación de tu archivo de modelo

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

router.post("/", async (req, res) => {
  try {
    const { error } = validateStrategicPlan(req.body);
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });

    const newStrategicPlan = new StrategicPlan(req.body);
    await newStrategicPlan.save();
    res
      .status(201)
      .json({ message: "Se creo StrategicPlanModel from correctamente" });
  } catch (error) {
    console.error(
      "Error al guardar la entrada en la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al guardar la entrada en la colección StrategicPlanModel en MongoDB",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del parámetro de la URL

    // Verificar si el plan existe antes de eliminar
    const plan = await StrategicPlan.findById(id);
    if (!plan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }

    // Eliminar el plan
    await StrategicPlan.findByIdAndDelete(id);

    // Actualizar los usuarios eliminando las invitaciones y el plan de sus listas
    await User.updateMany(
      { "invitations.planId": id },
      {
        $pull: {
          invitations: { planId: id },
          strategicPlanList: id, // Si `strategicPlanList` contiene el ID del plan
        },
      }
    );

    res.json({
      message:
        "StrategicPlanModel eliminado correctamente y usuarios actualizados",
    });
  } catch (error) {
    console.error(
      "Error al eliminar la entrada en la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al eliminar la entrada en la colección StrategicPlanModel en MongoDB",
    });
  }
});

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

// --------------------------------------------
// Rutas de invitación
// --------------------------------------------
router.get("/invitations/:userId", async (req, res) => {
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
      const updatedInvitation = {
        ...user.invitations[i]._doc, // Copia todas las propiedades existentes de la invitación
        planName: plan.name, // Agrega la nueva propiedad planName
      };

      // Agregar la invitación actualizada al array de respuestas
      response.push(updatedInvitation);
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

router.post("/sendInvitation", async (req, res) => {
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

router.post("/responseInvitation", async (req, res) => {
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
