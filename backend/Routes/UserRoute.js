const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User: UserModel, validateUser } = require("../Models/UserModel"); // Import the User model

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Function to handle "Forgot Password" request
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl =
      process.env.TARGET === "DEV"
        ? `${process.env.RESET_PASSWORD_DEV_URL}/${resetToken}`
        : `${process.env.RESET_PASSWORD_PROD_URL}/${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi! You have requested to reset your password. Click the button below to reset it:</p>
          <p>Remember that this link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="background-color: #9900ff; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">If you did not request this change, please ignore this email.</p>
          <p>Thank you!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reset email sent" });
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

/**
 * Function to reset the password
 */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Find the user by the token
    const user = await UserModel.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Verify if the user exists and the token is valid
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update the password
    // Hash the new password
    const salt = parseInt(process.env.SALT) || 10;
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await UserModel.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Route to validate the reset password token
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // If the token is valid
    res.status(200).json({ message: "Valid token" });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "Error validating token" });
  }
});

/**
 * Function to get all users
 * @returns {Object} - List of users
 * @throws {Object} - Error message
 */
router.get("/AllUsers", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching User collection in MongoDB:", error);
    res.status(500).json({
      error: "Error fetching User collection in MongoDB",
    });
  }
});

/**
 * Function to create a new user
 * @param req.body - User data
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.post("/create", async (req, res) => {
  try {
    // Validate user data
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message || "Invalid data",
      });
    }

    const { name, email } = req.body;

    // Check if the email is already registered
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Check if the name is already registered
    const nameExists = await UserModel.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Username is already registered" });
    }

    // Create new user
    const newUser = new UserModel(req.body);
    await newUser.save();

    // Return success response with new user ID
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error saving entry in User collection in MongoDB:", error);
    res.status(500).json({
      message: "Error saving entry in User collection in MongoDB",
    });
  }
});
/**
 * Function to update a user
 * @param req.body - User data to update
 * @param req.params - ID of user
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Desestructurar los campos name y email de req.body
    const { name, email } = req.body;
    // Verificar que ambos campos existan en la solicitud
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    // Actualizar solo name y email
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(201).json({
      message: "User updated successfully",
      user: updatedUser, // Devuelve el usuario actualizado si es necesario
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Failed to update user",
      error,
    });
  }
});

/**
 * Function to log in to the application
 * @param req.body - Login data
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.post("/login", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const user = await UserModel.findOne({
      $or: [
        { email: email }, // Search by email
        { name: name }, // Search by name
      ],
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Incorrect email/username or password" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect email/username or password" });
    }

    // Return successful response
    res.status(201).json({
      message: "Login successful",
      userActive: user,
    });
  } catch (error) {
    console.error("Error fetching User collection in MongoDB:", error);
    res.status(500).json({
      message: "Error fetching User collection in MongoDB",
    });
  }
});

module.exports = router;
