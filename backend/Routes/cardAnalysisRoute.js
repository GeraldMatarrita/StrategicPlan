const router = require("express").Router();
const { cardAnalysis, validateCardAnalysis } = require("../Models/CardAnalysisModel");

router.get("/getCard/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const card = cardAnalysis.findById(id);
        if (!card) {
            return res.status(404).json({ message: "Analysis not found" });
        }
        res.json(card);
    }
    catch (error) {
        console.error("Error fetching the analysis card:", error);
        res.status(500).json({
          message: "Error fetching the analysis card"
        });
    }
});

router.put("/updateCard/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCardData = req.body;

        const updatedCard = await cardAnalysis.findByIdAndUpdate(
            id,
            updatedCardData,
            { new: true }
        );

        if (!updatedCard) {
            return res.status(404).json({ message: "Analysis not found" });
        }

        res.status(200).json({
            message: "Analysis updated",
            card: updatedCard
        });
    } catch (error) {
        console.error("Error updating the analysis card:", error);
        res.status(500).json({
            message: "Error updating the analysis card"
        });
    }
});

module.exports = router;
