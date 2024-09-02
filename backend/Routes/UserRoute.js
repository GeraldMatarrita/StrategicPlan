const router = require("express").Router();
const { User: UserModel, validateUser } = require("../Models/UserModel"); // Importa el modelo User
const { StrategicPlan } = require("../Models/StrategicPlanModel");

router.get("/All-users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error("Error al consultar la colección User en MongoDB:", error);
    res.status(500).json({
      error: "Error al consultar la colección User en MongoDB",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    // Validar datos del usuario
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message || "Datos inválidos",
      });
    }

    const { name, email } = req.body;

    // Verificar si el email ya está registrado
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Verificar si el nombre ya está registrado
    const nameExists = await UserModel.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "El nombre ya está registrado" });
    }

    // Crear nuevo usuario
    const newUser = new UserModel(req.body);
    await newUser.save();

    // Devolver respuesta exitosa con ID del nuevo usuario
    res.status(201).json({
      message: "Usuario creado correctamente",
    });
  } catch (error) {
    console.error(
      "Error al guardar la entrada en la colección User en MongoDB:",
      error
    );
    res.status(500).json({
      message: "Error al guardar la entrada en la colección User en MongoDB",
    });
  }
});

module.exports = router;
