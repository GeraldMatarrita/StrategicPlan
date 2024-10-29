const router = require("express").Router();
const nodemailer = require("nodemailer");
const {
  StrategicPlan,
  validateStrategicPlan,
} = require("../Models/StrategicPlanModel"); // Import the StrategicPlanModel
const { User, validateUser } = require("../Models/UserModel"); // Adjust the path according to your model file location

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
 * Function that retrieves a user's invitations by their ID
 * @param {String} userId - User ID
 * @returns {Object} - List of invitations
 * @throws {Object} - Error message
 */
router.get("/UserInvitations/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({
      message: "User ID is required.",
    });
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId).populate("invitations");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Create a new array to store updated invitations
    const response = [];

    for (let i = 0; i < user.invitations.length; i++) {
      // Find the plan associated with the invitation
      const plan = await StrategicPlan.findById(user.invitations[i].planId);

      // Create a new invitation with the added planName property
      if (plan) {
        const updatedInvitation = {
          ...user.invitations[i]._doc, // Copy all existing properties from the invitation
          planName: plan.name, // Add the new planName property
        };

        // Add the updated invitation to the response array
        response.push(updatedInvitation);
      }
    }

    // Send the response with updated invitations
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
 * Function that gets the count of pending invitations for a user by their ID
 * @param {String} userId - User ID
 * @returns {Object} - Count of pending invitations
 * @throws {Object} - Error message
 */
router.get("/pendingCount/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({
      message: "User ID is required.",
    });
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Count pending invitations
    const pendingCount = user.invitations.filter(
      (invitation) => invitation.status === "pending"
    ).length;

    // Send the response with the count of pending invitations
    res.status(200).json({
      pendingCount,
    });
  } catch (error) {
    console.error("Error getting pending invitations count:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Function to get users who are not in the member list of a strategic plan
 * @param {String} planId - Strategic plan ID
 * @returns {Object} - List of users not in the plan
 * @throws {Object} - Error message
 */
router.get("/getUsersNotInPlan/:planId", async (req, res) => {
  const { planId } = req.params;

  if (!planId) {
    return res.status(400).json({
      message: "Plan ID is required.",
    });
  }

  try {
    // Check if the strategic plan exists
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Strategic plan not found.",
      });
    }

    // Get all users
    const users = await User.find();

    // Filter users who are not in the plan's member list and do not have a pending or accepted invitation
    const response = users.filter((user) => {
      const isMember = plan.members_ListIDS.some(
        (member) => member._id.toString() === user._id.toString()
      );

      const hasInvitation = user.invitations.some(
        (invitation) =>
          invitation.planId.toString() === planId &&
          (invitation.status === "pending" || invitation.status === "accepted")
      );

      return !isMember && !hasInvitation;
    });

    // Return the list of users not in the plan
    return res.status(200).json({
      users: response,
      message: "OK.",
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

/**
 * Function that creates a new invitation for a user by their ID with a pending status to the received planId
 * @param {String} userId - User ID to be invited
 * @param {String} planId - Strategic plan ID to which the user is invited
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.post("/create", async (req, res) => {
  const { userId, planId } = req.body;

  if (!userId || !planId) {
    return res.status(400).json({
      message: "User ID and Plan ID are required.",
    });
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Check if the plan exists
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Strategic plan not found.",
      });
    }

    // Check if a pending invitation already exists for this plan
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

    // Add the invitation
    user.invitations.push({
      planId,
      status: "pending",
    });

    await user.save();

    // Invitation URL (different between DEV and PROD)
    const invitationUrl =
      process.env.TARGET === "DEV"
        ? process.env.INVITATION_DEV_URL
        : process.env.INVITATION_PROD_URL;

    const emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
          <h2 style="color: #333;">New Strategic Plan Invitation</h2>
          <p>You have been invited to join the strategic plan: <strong>${plan.name}</strong></p>
          <p>Click the button below to view and manage your invitations:</p>
          <a href="${invitationUrl}" style="background-color: #28a745; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Invitations</a>
          <p style="margin-top: 20px;">Remember that you must be logged in to see your invitations.</p>
        </div>
      `;

    // Mail options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Strategic Plan Invitation",
      html: emailContent,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

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
 * Function that responds to an invitation with an accepted or declined status, using userId, planId, and decision
 * @param {String} userId - ID of the user responding to the invitation
 * @param {String} planId - ID of the strategic plan the invitation responds to
 * @param {Boolean} decision - User's decision, true to accept, false to decline
 * @returns {Object} - Confirmation message
 * @throws {Object} - Error message
 */
router.post("/response", async (req, res) => {
  const { userId, planId, decision } = req.body;

  if (!userId || !planId || decision === undefined) {
    return res.status(400).json({
      message: "User ID, decision, and Plan ID are required.",
    });
  }

  try {
    // Verify if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Verify if the plan exists
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Strategic plan not found.",
      });
    }

    // Check if there is a pending invitation for this plan
    const invitationIndex = user.invitations.findIndex(
      (inv) => inv.planId.toString() === planId && inv.status === "pending"
    );
    if (invitationIndex === -1) {
      return res.status(400).json({
        message: "Invitation not found or not pending.",
      });
    }

    // Update the invitation status
    user.invitations[invitationIndex].status = decision
      ? "accepted"
      : "declined";

    if (decision) {
      // Only add the plan if the decision is accepted
      if (!user.strategicPlans_ListIDS.includes(planId)) {
        user.strategicPlans_ListIDS.push(planId);
      }
      if (!plan.members_ListIDS.includes(userId)) {
        plan.members_ListIDS.push(userId);
      }
      // Save the changes in the plan
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

  router.delete("/deleteInvitation/:userId/:planId", async (req, res) => {
    const { userId, planId } = req.params;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      // Filter the user's invitations and delete the one for the plan
      user.invitations = user.invitations.filter(
        (inv) => inv.planId.toString() !== planId.toString()
      );

      await user.save();
      res.status(200).json({ message: "Invitation deleted successfully" });
    } catch (err) {
      res.status(500).send("Error deleting invitation");
    }
  });
});

module.exports = router;
