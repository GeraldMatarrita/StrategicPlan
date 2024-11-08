const router = require("express").Router();

const { cardAnalysis, validateCardAnalysis } = require("../Models/CardAnalysisModel");
const SWOT = require("../Models/SwotModel"); // Import the SwotModel
const { StrategicPlan } = require("../Models/StrategicPlanModel"); // Import the StrategicPlanModel

/**
 * Adds a new card analysis to the strengths category in the SWOT model.
 * @param {string} req.params.id - The ID of the strategic plan.
 * @param {Object} req.body - The card analysis data.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/strengths/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id); // Find the Strategic Plan by ID
        if (!strategicPlan) {
            return res.status(500).json({ message: "StrategicPlanModel not found" }); // Handle error if no Strategic Plan is found
        }
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT); // Find the SWOT analysis by ID
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" }); // Handle error if no SWOT analysis is found
        }

        // Create a new card analysis and save it to the database
        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();

        // Add the new card analysis to the strengths array in the SWOT analysis
        await swotAnalysis.strengths.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({ message: `New analysis added` }); // Send a success message
    } catch (error) {
        console.error("Error inserting the new analysis into MongoDB:", error);
        res.status(404).json({ message: "Error querying the SWOT collection in MongoDB" }); // Handle server error
    }
});

/**
 * Adds a new card analysis to the weaknesses category in the SWOT model.
 * @param {string} req.params.id - The ID of the strategic plan.
 * @param {Object} req.body - The card analysis data.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/weaknesses/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res.status(500).json({ message: "StrategicPlanModel not found" }); // Handle error if no Strategic Plan is found
        }

        // Find the SWOT analysis by ID
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" }); // Handle error if no SWOT analysis is found
        }

        // Create a new card analysis and save it to the database
        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();

        // Add the new card analysis to the weaknesses array in the SWOT analysis
        await swotAnalysis.weaknesses.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({ message: `New analysis added` }); // Send a success message
    } catch (error) {
        console.error("Error inserting the new analysis into MongoDB:", error);
        res.status(404).json({ message: "Error querying the SWOT collection in MongoDB" }); // Handle server error
    }
});

/**
 * Adds a new card analysis to the opportunities category in the SWOT model.
 * @param {string} req.params.id - The ID of the strategic plan.
 * @param {Object} req.body - The card analysis data.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/opportunities/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res.status(500).json({ message: "StrategicPlanModel not found" }); // Handle error if no Strategic Plan is found
        }
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" }); // Handle error if no SWOT analysis is found 
        }

        // Create a new card analysis and save it to the database
        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();

        // Add the new card analysis to the opportunities array in the SWOT analysis
        await swotAnalysis.opportunities.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({ message: `New analysis added` }); // Send a success message
    } catch (error) {
        console.error("Error inserting the new analysis into MongoDB:", error);
        res.status(404).json({ message: "Error querying the SWOT collection in MongoDB" }); // Handle server error
    }
});

/**
 * Adds a new card analysis to the threats category in the SWOT model.
 * @param {string} req.params.id - The ID of the strategic plan.
 * @param {Object} req.body - The card analysis data.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/threats/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res.status(500).json({ message: "StrategicPlanModel not found" });
        }
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" });
        }

        // Create a new card analysis and save it to the database
        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();

        // Add the new card analysis to the threats array in the SWOT analysis
        await swotAnalysis.threats.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({ message: `New analysis added` }); // Send a success message
    } catch (error) {
        console.error("Error inserting the new analysis into MongoDB:", error);
        res.status(404).json({ message: "Error querying the SWOT collection in MongoDB" }); // Handle server error
    }
});

/**
 * Retrieves all card analyses for a given SWOT analysis.
 * @param {string} req.params.id - The ID of the strategic plan.
 * @returns {Object} - JSON object containing the SWOT analysis with populated categories.
 */
router.get("/allAnalisis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res.status(500).json({ message: "StrategicPlanModel not found" }); // Handle error if no Strategic Plan is found
        }

        // Find the SWOT analysis by ID and populate the categories
        SWOT.findById(strategicPlan.SWOT)
            .populate('strengths')
            .populate('weaknesses')
            .populate('opportunities')
            .populate('threats')
            .then(swot => res.json(swot))
            .catch(error => console.error(error));
    } catch (error) {
        console.error("Error obtaining the MECA analysis data:", error);
        res.status(404).json({ message: "Error obtaining the MECA analysis data" }); // Handle server error
    }
});

/**
 * Deletes a card analysis from the strengths category in the SWOT model.
 * @param {string} req.params.id - The SWOT ID.
 * @param {string} req.body._id - The card analysis ID to delete.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/strengths/deleteCard/:id", async (req, res) => {
    try {
        const { id } = req.params; // SWOT ID
        const { _id } = req.body; // cardAnalysis ID to delete

        // Find the Strategic Plan by ID
        const stratPlan = await StrategicPlan.findById(id);
        if (!stratPlan) {
            return res.status(402).json({ message: "Strategic Plan not found" });
        }

        // Find the associated SWOT document
        const swot = await SWOT.findById(stratPlan.SWOT);
        if (!swot) {
            return res.status(402).json({ message: "SWOT not found" });
        }

        // Remove the cardAnalysis ID from the strengths array
        swot.strengths.pull(_id);

        // Save the updated SWOT
        await swot.save();

        await cardAnalysis.findByIdAndDelete(_id); // Delete the cardAnalysis document from the database

        res.status(200).json({ message: "Card deleted successfully from Strengths" }); // Send a success message
    } catch (error) {
        console.error("Error while deleting card from Strengths:", error);
        res.status(500).json({ message: "Error while deleting card from Strengths" }); // Handle server error
    }
});

/**
 * Deletes a card analysis from the weaknesses category in the SWOT model.
 * @param {string} req.params.id - The SWOT ID.
 * @param {string} req.body._id - The card analysis ID to delete.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/weaknesses/deleteCard/:id", async (req, res) => {
    try {
        const { id } = req.params; // SWOT ID
        const { _id } = req.body; // cardAnalysis ID to delete

        // Find the Strategic Plan by ID
        const stratPlan = await StrategicPlan.findById(id);
        if (!stratPlan) {
            return res.status(402).json({ message: "Strategic Plan not found" });
        }

        // Find the associated SWOT document
        const swot = await SWOT.findById(stratPlan.SWOT);
        if (!swot) {
            return res.status(402).json({ message: "SWOT not found" });
        }

        // Remove the cardAnalysis ID from the weaknesses array
        swot.weaknesses.pull(_id);

        // Save the updated SWOT
        await swot.save();

        const deletedCard = await cardAnalysis.findByIdAndDelete(_id); // Delete the cardAnalysis document from the database

        res.status(200).json({ message: "Card deleted successfully from Weaknesses" }); // Send a success message
    } catch (error) {
        console.error("Error while deleting card from Weaknesses:", error);
        res.status(500).json({ message: "Error while deleting card from Weaknesses" });
    }
});

/**
 * Deletes a card analysis from the opportunities category in the SWOT model.
 * @param {string} req.params.id - The SWOT ID.
 * @param {string} req.body._id - The card analysis ID to delete.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/opportunities/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // SWOT ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const stratPlan = await StrategicPlan.findById(id); // Find the Strategic Plan by ID
    if (!stratPlan) {
      return res.status(402).json({ message: "Strategic Plan not found" }); // Handle error if no Strategic Plan is found
    }

    const swot = await SWOT.findById(stratPlan.SWOT); // Find the associated SWOT document
    if (!swot) {
      return res.status(402).json({ message: "SWOT not found" }); // Handle error if no SWOT is found
    }

    // Remove the cardAnalysis ID from the opportunities array
    swot.opportunities.pull(_id);

    // Save the updated SWOT
    await swot.save();

    // Delete the cardAnalysis document from the database
    await cardAnalysis.findByIdAndDelete(_id);
    
    res.status(200).json({ message: "Card deleted successfully from Opportunities" }); // Send a success message
  } catch (error) {
    console.error("Error while deleting card from Opportunities:", error);
    res.status(500).json({ message: "Error while deleting card from Opportunities" }); // Handle server error
  }
});

/**
 * Deletes a card analysis from the threats category in the SWOT model.
 * @param {string} req.params.id - The SWOT ID.
 * @param {string} req.body._id - The card analysis ID to delete.
 * @returns {Object} - JSON message indicating success or failure.
 */
router.post("/threats/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // SWOT ID
    const { _id } = req.body; // cardAnalysis ID to delete

    // Find the Strategic Plan by ID
    const stratPlan = await StrategicPlan.findById(id);
    if (!stratPlan) {
      return res.status(402).json({ message: "Strategic Plan not found" });
    }
    // Find the associated SWOT document
    const swot = await SWOT.findById(stratPlan.SWOT);
    if (!swot) {
      return res.status(402).json({ message: "SWOT not found" });
    }

    // Remove the cardAnalysis ID from the threats array
    swot.threats.pull(_id);

    // Save the updated SWOT
    await swot.save();

    // Delete the cardAnalysis document from the database
    const deletedCard = await cardAnalysis.findByIdAndDelete(_id);
    
    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error while deleting card:", error);
    res.status(500).json({ message: "Error while deleting card" });
  }
});

module.exports = router;