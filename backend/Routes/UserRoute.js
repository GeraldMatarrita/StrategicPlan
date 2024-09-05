const router = require("express").Router();
const { User: UserModel, validateUser } = require("../Models/UserModel"); // Importa el modelo User

/**
 * función que obtiene todos los usuarios
 * @returns {Object} - Lista de usuarios
 * @throws {Object} - Mensaje de error
 */
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

/**
 * función que crea un nuevo usuario
 * @param req.body - Datos del usuario
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 */
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

/**
 * función que inicia sesión en la aplicación
 * @param req.body - Datos de inicio de sesión
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 */
router.post("/login", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el email ya está registrado
    const user = await UserModel.findOne({
      $or: [
        { email: email }, // Buscar por email
        { name: name }, // Buscar por nombre
      ],
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email/UserName o contraseña incorrectos" });
    }

    // Verificar si la contraseña es correcta
    if (user.password !== password) {
      return res
        .status(400)
        .json({ message: "Email/UserName o contraseña incorrectos" });
    }

    // Devolver respuesta exitosa
    res.status(201).json({
      message: "Inicio de sesión correcto",
      userActive: user,
    });
  } catch (error) {
    console.error("Error al consultar la colección User en MongoDB:", error);
    res.status(500).json({
      message: "Error al consultar la colección User en MongoDB",
    });
  }
});

module.exports = router;
