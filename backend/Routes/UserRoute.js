const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User: UserModel, validateUser, User } = require("../Models/UserModel"); 

// Configure nodemailer to send emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Function to get a user by ID
 * @param req.params.id - ID of the user
 * @returns {Object} - User data
 * @throws {Object} - Error message
 */
router.get("/getUserById/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters
    const user = await UserModel.findById(id); // Find the user by ID
    res.json(user); // Return the user data
  } catch (error) {
    console.error("Error fetching User collection in MongoDB:", error); 
    res.status(500).json({
      error: "Error fetching User collection in MongoDB", // Handle server error
    });
  }
});


/**
 * Function to handle "Forgot Password" request
 * @param req.body.email - Email of the user
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body; // Get the email from the request body
    const user = await UserModel.findOne({ email }); // Find the user by email

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // If no user is found, return an error
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex"); // Generate a random token
    user.resetPasswordToken = resetToken; // Save the token to the user
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save(); // Save the user

    // Send email
    const resetUrl =
      process.env.TARGET === "DEV"
        ? `${process.env.RESET_PASSWORD_DEV_URL}/${resetToken}` // Development URL
        : `${process.env.RESET_PASSWORD_PROD_URL}/${resetToken}`; // Production URL

    // Email content and configuration
    const mailOptions = {
      from: process.env.SMTP_USER, // Sender address
      to: user.email, // Recipient address
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

    await transporter.sendMail(mailOptions); // Send the email
    res.status(200).json({ message: "Reset email sent" }); // Return success message
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ message: "Error sending reset email" }); // Handle server error  
  }
});

/**
 * Function to reset the password
 * @param req.params.token - Reset token
 * @param req.body.newPassword - New password
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { newPassword } = req.body; // Get the new password from the request body

    // Find the user by the token
    const user = await UserModel.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Verify if the user exists and the token is valid
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = parseInt(process.env.SALT) || 10; // Get the salt rounds from the environment variables
    const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash the new password
    await UserModel.updateOne( // Update the user with the new password
      { _id: user._id },
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      }
    );

    res.status(200).json({ message: "Password updated successfully" }); // Return success message
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" }); // Handle server error
  }
});

// Route to validate the reset password token
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({ // Find the user by the token
      resetPasswordToken: req.params.token, // Get the token from the request parameters
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" }); // If the token is invalid, return an error
    }

    // If the token is valid
    res.status(200).json({ message: "Valid token" }); // Return success message
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "Error validating token" }); // Handle server error
  }
});

/**
 * Function to get all users
 * @returns {Object} - List of users
 * @throws {Object} - Error message
 */
router.get("/AllUsers", async (req, res) => {
  try {
    const users = await UserModel.find(); // Find all users
    res.json(users); // Return the list of users
  } catch (error) {
    console.error("Error fetching User collection in MongoDB:", error);
    res.status(500).json({
      error: "Error fetching User collection in MongoDB", // Handle server error
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
        message: error.details[0].message || "Invalid data", // If validation fails, return an error
      });
    }

    const { name, email } = req.body; // Get the name and email from the request body

    // Check if the email is already registered
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already registered" }); // If the email is already registered, return an error
    }

    // Check if the name is already registered
    const nameExists = await UserModel.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Username is already registered" }); // If the name is already registered, return an error
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
      message: "Error saving entry in User collection in MongoDB", // Handle server error
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
    const { id } = req.params; // Get the ID from the request parameters
    const { realName, email } = req.body; // Get the name and email from the request body

    // Check that both name and email are provided
    if (!realName || !email) {
      return res.status(400).json({
        message: "Name and email are required.", // If either name or email is missing, return an error
      });
    }

    // Find the user by ID
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found", // If no user is found, return an error
      });
    }

    // Check if the email is being changed
    if (user.email !== email) {
      // Check if another user already has this email
      const otherUser = await UserModel.findOne({ email });
      if (otherUser) {
        return res.status(409).json({
          message: "Another user already has this email", // If another user has this email, return an error
        });
      }
    }

    // Update the user fields
    user.realName = realName;
    user.email = email;
    
    // Save the updated user
    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user, // Return the updated user
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Failed to update user", // Handle server error
      error: error.message,
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
    const { name, email, password } = req.body; // Get the name, email, and password from the request body

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
        .json({ message: "Incorrect email/username or password" }); // If no user is found, return an error
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password); // Compare the password with the hashed password
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect email/username or password" }); // If the password is incorrect, return an error
    }

    // Return successful response
    res.status(201).json({
      message: "Login successful", // Return a success message
      userActive: user,
    });
  } catch (error) {
    console.error("Error fetching User collection in MongoDB:", error);
    res.status(500).json({
      message: "Error fetching User collection in MongoDB", // Handle server error
    });
  }
});

// Export the router
module.exports = router;
