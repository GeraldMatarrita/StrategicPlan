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

router.get("/plans-to-user/:userId", async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).populate("strategicPlans_ListIDS");
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  res.json(user.strategicPlans_ListIDS);
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

module.exports = router;
