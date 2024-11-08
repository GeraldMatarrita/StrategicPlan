const router = require("express").Router();
const { cardAnalysis, validateCardAnalysis } = require("../Models/CardAnalysisModel");
const CAME = require("../Models/CameModel"); // Import the CAME model
const { StrategicPlan } = require("../Models/StrategicPlanModel"); // Import the StrategicPlanModel

/**
 * Add Card Analysis to "Correct" in CAME.
 * This route adds a new card analysis to the "Correct" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis data to add
 * @returns {object} 201 - Success message
 * @returns {string} 500 - Error message
*/
router.post("/correct/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by the CAME ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    // Create a new card analysis object with the request body
    const newAnalysis = new cardAnalysis(req.body);
    await newAnalysis.save();

    // Add the new card analysis to the 'correct' array in the CAME analysis
    await cameAnalysis.correct.push(newAnalysis._id);
    await cameAnalysis.save(); // Save the updated CAME analysis

    res.status(201).json({ message: `New analysis added to Correct` }); // Return success message
  } catch (error) {
    console.error("Error adding analysis to Correct in MongoDB:", error); 
    res.status(500).json({ message: "Error adding analysis to Correct in MongoDB" }); // Return error message
  }
});

/**
 * Add Card Analysis to "Afront" in CAME.
 * This route adds a new card analysis to the "Afront" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis data to add
 * @returns {object} 201 - Success message
 * @returns {string} 500 - Error message
 */
router.post("/afront/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID

    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    // Create a new card analysis object with the request body
    const newAnalysis = new cardAnalysis(req.body);
    await newAnalysis.save();

    // Add the new card analysis to the 'afront' array in the CAME analysis
    await cameAnalysis.afront.push(newAnalysis._id); // Add card to the 'afront' array
    await cameAnalysis.save();

    // Return success message
    res.status(201).json({ message: `New analysis added to Afront` });
  } catch (error) {
    console.error("Error adding analysis to Afront in MongoDB:", error);
    res.status(500).json({ message: "Error adding analysis to Afront in MongoDB" }); // Return error message
  }
});

/**
 * Add Card Analysis to "Maintain" in CAME.
 * This route adds a new card analysis to the "Maintain" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis data to add
 * @returns {object} 201 - Success message
 * @returns {string} 500 - Error message
 */
router.post("/maintain/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    // Create a new card analysis object with the request body
    const newAnalysis = new cardAnalysis(req.body); 
    await newAnalysis.save();

    // Add the new card analysis to the 'maintain' array in the CAME analysis
    await cameAnalysis.maintain.push(newAnalysis._id); // Add card to the 'maintain' array
    await cameAnalysis.save();

    res.status(201).json({ message: `New analysis added to Maintain` }); // Return success message
  } catch (error) {
    console.error("Error adding analysis to Maintain in MongoDB:", error);
    res.status(500).json({ message: "Error adding analysis to Maintain in MongoDB" }); // Return error message
  }
});

/**
 * Add Card Analysis to "Explore" in CAME.
 * This route adds a new card analysis to the "Explore" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis data to add
 * @returns {object} 201 - Success message
 * @returns {string} 500 - Error message
 */
router.post("/explore/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    // Create a new card analysis object with the request body
    const newAnalysis = new cardAnalysis(req.body);
    await newAnalysis.save();

    // Add the new card analysis to the 'explore' array in the CAME analysis
    await cameAnalysis.explore.push(newAnalysis._id); // Add card to the 'explore' array
    await cameAnalysis.save();

    res.status(201).json({ message: `New analysis added to Explore` }); // Return success message
  } catch (error) {
    console.error("Error adding analysis to Explore in MongoDB:", error);
    res.status(500).json({ message: "Error adding analysis to Explore in MongoDB" }); // Return error message
  }
});

/**
 * Get all Card Analyses in CAME.
 * This route fetches all card analyses in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @returns {object} 200 - List of card analyses
 * @returns {string} 500 - Error message
 */
router.get("/allAnalisis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME) // Find CAME by ID in StrategicPlan
      .populate('correct')
      .populate('afront')
      .populate('maintain')
      .populate('explore');
      
    if (!cameAnalysis) { 
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    res.json(cameAnalysis); // Return the CAME analysis
  } catch (error) {
    console.error("Error fetching CAME analysis:", error);
    res.status(500).json({ message: "Error fetching CAME analysis" }); // Return error message
  }
});


/**
 * Delete Card Analysis from "Correct" in CAME.
 * This route deletes a card analysis from the "Correct" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis ID to delete
 * @returns {object} 200 - Success message
 * @returns {string} 500 - Error message
 */
router.post("/correct/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    cameAnalysis.correct.pull(_id); // Remove cardAnalysis ID from correct array
    await cameAnalysis.save(); // Save the updated CAME analysis

    await cardAnalysis.findByIdAndDelete(_id); // Delete the card analysis from the database

    res.status(200).json({ message: "Card deleted successfully from Correct" }); // Return success message
  } catch (error) {
    console.error("Error deleting card from Correct:", error);
    res.status(500).json({ message: "Error deleting card from Correct" }); // Return error message
  }
});

/**
 * Delete Card Analysis from "Afront" in CAME.
 * This route deletes a card analysis from the "Afront" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis ID to delete
 * @returns {object} 200 - Success message
 * @returns {string} 500 - Error message
 */
router.post("/afront/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    cameAnalysis.afront.pull(_id); // Remove cardAnalysis ID from afront array
    await cameAnalysis.save(); // Save the updated CAME analysis

    await cardAnalysis.findByIdAndDelete(_id); // Delete the card analysis from the database

    res.status(200).json({ message: "Card deleted successfully from Afront" }); // Return success message
  } catch (error) {
    console.error("Error deleting card from Afront:", error);
    res.status(500).json({ message: "Error deleting card from Afront" }); // Return error message
  }
});

/**
 * Delete Card Analysis from "Maintain" in CAME.
 * This route deletes a card analysis from the "Maintain" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis ID to delete
 * @returns {object} 200 - Success message
 * @returns {string} 500 - Error message
 */
router.post("/maintain/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    cameAnalysis.maintain.pull(_id); // Remove cardAnalysis ID from maintain array
    await cameAnalysis.save(); // Save the updated CAME analysis

    await cardAnalysis.findByIdAndDelete(_id); // Delete the card analysis from the database

    res.status(200).json({ message: "Card deleted successfully from Maintain" }); // Return success message
  } catch (error) {
    console.error("Error deleting card from Maintain:", error);
    res.status(500).json({ message: "Error deleting card from Maintain" }); // Return error message
  }
});

/**
 * Delete Card Analysis from "Explore" in CAME.
 * This route deletes a card analysis from the "Explore" category in the CAME analysis.
 * @param {string} id.path.required - The ID of the StrategicPlan
 * @param {object} body.body.required - The card analysis ID to delete
 * @returns {object} 200 - Success message
 * @returns {string} 500 - Error message
 */
router.post("/explore/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" }); // Return error if StrategicPlan not found 
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME);
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" }); // Return error if CAME analysis not found
    }

    cameAnalysis.explore.pull(_id); // Remove cardAnalysis ID from explore array
    await cameAnalysis.save(); // Save the updated CAME analysis

    await cardAnalysis.findByIdAndDelete(_id); // Delete the card analysis from the

    res.status(200).json({ message: "Card deleted successfully from Explore" }); // Return success message
  } catch (error) {
    console.error("Error deleting card from Explore:", error);
    res.status(500).json({ message: "Error deleting card from Explore" }); // Return error message
  }
});

// Export the router
module.exports = router;
