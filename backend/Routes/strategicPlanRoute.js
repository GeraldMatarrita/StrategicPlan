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
    const result = await StrategicPlan.findByIdAndDelete(id);
    if (!result) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }
    res.json({ message: "StrategicPlanModel eliminado correctamente" });
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

router.post("/invite", async (req, res) => {
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
      (inv) => inv.planId.toString() === planId && inv.status === "pending"
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

module.exports = router;
