const router = require("express").Router();

const { cardAnalysis, validateCardAnalysis } = require("../Models/CardAnalysisModel");
const SWOT = require("../Models/SwotModel"); // Import the SwotModel
const { StrategicPlan } = require("../Models/StrategicPlanModel"); // Import the StrategicPlanModel

router.post("/strengths/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res
                .status(500)
                .json({ message: "StrategicPlanModel not found" });
        }
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" });
        }

        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();
        await swotAnalysis.strengths.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({
            message: `New analysis added`,
        });

    } catch (error) {
        console.error(
            "Error inserting the new analysis into MongoDB:",
            error
        );
        res.status(404).json({
            message: "Error querying the SWOT collection in MongoDB",
        });
    }
});

router.post("/weaknesses/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res
                .status(500)
                .json({ message: "StrategicPlanModel not found" });
        }
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" });
        }

        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();
        await swotAnalysis.weaknesses.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({
            message: `New analysis added`,
        });

    } catch (error) {
        console.error(
            "Error inserting the new analysis into MongoDB:",
            error
        );
        res.status(404).json({
            message: "Error querying the SWOT collection in MongoDB",
        });
    }
});

router.post("/opportunities/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res
                .status(500)
                .json({ message: "StrategicPlanModel not found" });
        }
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" });
        }

        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();
        await swotAnalysis.opportunities.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({
            message: `New analysis added`,
        });

    } catch (error) {
        console.error(
            "Error inserting the new analysis into MongoDB:",
            error
        );
        res.status(404).json({
            message: "Error querying the SWOT collection in MongoDB",
        });
    }
});

router.post("/threats/addCardAnalysis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res
                .status(500)
                .json({ message: "StrategicPlanModel not found" });
        }
        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" });
        }

        const newAnalysis = new cardAnalysis(req.body);
        await newAnalysis.save();
        await swotAnalysis.threats.push(newAnalysis._id);
        await swotAnalysis.save();

        res.status(201).json({
            message: `New analysis added`,
        });

    } catch (error) {
        console.error(
            "Error inserting the new analysis into MongoDB:",
            error
        );
        res.status(404).json({
            message: "Error querying the SWOT collection in MongoDB",
        });
    }
});

router.get("/allAnalisis/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter
        const strategicPlan = await StrategicPlan.findById(id);
        if (!strategicPlan) {
            return res
                .status(500)
                .json({ message: "StrategicPlanModel not found" });
        }

        const swotAnalysis = await SWOT.findById(strategicPlan.SWOT);
        if (!swotAnalysis) {
            return res.status(500).json({ message: "SWOT analysis not found" });
        }

        SWOT.findById(strategicPlan.SWOT)
            .populate('strengths')
            .populate('weaknesses')
            .populate('opportunities')
            .populate('threats')
            .then(swot => {
                res.json(swot);
            })
            .catch(error => console.error(error));

    } catch (error) {
        console.error(
            "Error obtaining the MECA analysis data:",
            error
        );
        res.status(404).json({
            message: "Error obtaining the MECA analysis data",
        });
    }
});

router.post("/strengths/deleteCard/:id", async (req, res) => {
    try {
        const { id } = req.params; // SWOT ID
        const { _id } = req.body; // cardAnalysis ID to delete

        const stratPlan = await StrategicPlan.findById(id);
        if (!stratPlan) {
            return res.status(402).json({ message: "Strategic Plan not found" });
        }

        const swot = await SWOT.findById(stratPlan.SWOT);
        if (!swot) {
            return res.status(402).json({ message: "SWOT not found" });
        }

        // Remove the cardAnalysis ID from the strengths array
        swot.strengths.pull(_id);

        // Save the updated SWOT
        await swot.save();

        const deletedCard = await cardAnalysis.findByIdAndDelete(_id);

        res.status(200).json({ message: "Card deleted successfully from Strengths" });
    } catch (error) {
        console.error("Error while deleting card from Strengths:", error);
        res.status(500).json({ message: "Error while deleting card from Strengths" });
    }
});

router.post("/weaknesses/deleteCard/:id", async (req, res) => {
    try {
        const { id } = req.params; // SWOT ID
        const { _id } = req.body; // cardAnalysis ID to delete

        const stratPlan = await StrategicPlan.findById(id);
        if (!stratPlan) {
            return res.status(402).json({ message: "Strategic Plan not found" });
        }

        const swot = await SWOT.findById(stratPlan.SWOT);
        if (!swot) {
            return res.status(402).json({ message: "SWOT not found" });
        }

        // Remove the cardAnalysis ID from the weaknesses array
        swot.weaknesses.pull(_id);

        // Save the updated SWOT
        await swot.save();

        const deletedCard = await cardAnalysis.findByIdAndDelete(_id);

        res.status(200).json({ message: "Card deleted successfully from Weaknesses" });
    } catch (error) {
        console.error("Error while deleting card from Weaknesses:", error);
        res.status(500).json({ message: "Error while deleting card from Weaknesses" });
    }
});





router.post("/opportunities/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // SWOT ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const stratPlan = await StrategicPlan.findById(id);
    if (!stratPlan) {
      return res.status(402).json({ message: "Strategic Plan not found" });
    }

    const swot = await SWOT.findById(stratPlan.SWOT);
    if (!swot) {
      return res.status(402).json({ message: "SWOT not found" });
    }

    // Remove the cardAnalysis ID from the opportunities array
    swot.opportunities.pull(_id);

    // Save the updated SWOT
    await swot.save();

    await cardAnalysis.findByIdAndDelete(_id);
    
    res.status(200).json({ message: "Card deleted successfully from Opportunities" });
  } catch (error) {
    console.error("Error while deleting card from Opportunities:", error);
    res.status(500).json({ message: "Error while deleting card from Opportunities" });
  }
});

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