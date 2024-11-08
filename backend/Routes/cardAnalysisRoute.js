const router = require("express").Router();
const {
  cardAnalysis,
  validateCardAnalysis,
} = require("../Models/CardAnalysisModel");

/**
 * Get an analysis card by ID.
 * This route retrieves an analysis card by its unique identifier.
 * @param {string} id.path.required - The ID of the analysis card to retrieve
 */
router.get("/getCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters
    const card = cardAnalysis.findById(id); // Find the analysis card by ID
    if (!card) {
      return res.status(404).json({ message: "Analysis not found" }); // If no card is found, return an error
    }
    res.json(card); // Send the analysis card object
  } catch (error) {
    console.error("Error fetching the analysis card:", error); // Handle server error
    res.status(500).json({
      message: "Error fetching the analysis card", // Send an error message
    });
  }
});

/**
 * Update an analysis card by ID.
 * This route updates an existing analysis card with new data.
 * @param {string} id.path.required - The ID of the analysis card to update
 * @param {object} body.body.required - The updated analysis card data
 * @returns {object} 200 - The updated analysis card object
 * @returns {string} 404 - Analysis not found
 * @returns {string} 500 - Error message
 */
router.put("/updateCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters
    const updatedCardData = req.body; // Get the updated data from the request body

    const updatedCard = await cardAnalysis.findByIdAndUpdate(
      // Find and update the analysis card by ID
      id,
      updatedCardData,
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: "Analysis not found" }); // If no card is found, return an error
    }

    res.status(200).json({
      message: "Analysis updated", // Send a success message
      card: updatedCard,
    });
  } catch (error) {
    console.error("Error updating the analysis card:", error); // Handle server error
    res.status(500).json({
      message: "Error updating the analysis card", // Send an error message
    });
  }
});

// Export the router
module.exports = router;
