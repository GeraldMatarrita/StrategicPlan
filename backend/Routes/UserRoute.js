const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User: UserModel, validateUser } = require("../Models/UserModel"); // Importa el modelo User

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * función para manejar la solicitud de "Olvidé mi contraseña"
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar un token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // Enviar correo electrónico
    const resetUrl = `${process.env.RESET_PASSWORD_URL}/${resetToken}`;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Restablecimiento de contraseña",
      text: `Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo de restablecimiento enviado" });
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento:", error);
    res.status(500).json({ message: "Error al enviar el correo de restablecimiento" });
  }
});

/**
 * función para restablecer la contraseña
 */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const { newPassword } = req.body;

    // Actualizar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
});

/**
 * función que obtiene todos los usuarios
 * @returns {Object} - Lista de usuarios
 * @throws {Object} - Mensaje de error
 */
router.get("/AllUsers", async (req, res) => {
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
router.post("/create", async (req, res) => {
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email/UserName o contraseña incorrectos" });
    }

    // // Verificar si la contraseña es correcta
    // if (user.password !== password) {
    //   return res
    //     .status(400)
    //     .json({ message: "Email/UserName o contraseña incorrectos" });
    // }

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
