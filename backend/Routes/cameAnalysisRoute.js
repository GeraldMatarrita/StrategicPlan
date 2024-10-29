const router = require("express").Router();
const { cardAnalysis, validateCardAnalysis } = require("../Models/CardAnalysisModel");
const CAME = require("../Models/CameModel"); // Import the CAME model
const { StrategicPlan } = require("../Models/StrategicPlanModel"); // Import the StrategicPlanModel

// Add Card Analysis to "Correct" in CAME
router.post("/correct/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by the CAME ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    const newAnalysis = new cardAnalysis(req.body);
    await newAnalysis.save();
    await cameAnalysis.correct.push(newAnalysis._id); // Add card to the 'correct' array
    await cameAnalysis.save();

    res.status(201).json({ message: `New analysis added to Correct` });
  } catch (error) {
    console.error("Error adding analysis to Correct in MongoDB:", error);
    res.status(500).json({ message: "Error adding analysis to Correct in MongoDB" });
  }
});

// Add Card Analysis to "Afront" in CAME
router.post("/afront/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    const newAnalysis = new cardAnalysis(req.body);
    await newAnalysis.save();
    await cameAnalysis.afront.push(newAnalysis._id); // Add card to the 'afront' array
    await cameAnalysis.save();

    res.status(201).json({ message: `New analysis added to Afront` });
  } catch (error) {
    console.error("Error adding analysis to Afront in MongoDB:", error);
    res.status(500).json({ message: "Error adding analysis to Afront in MongoDB" });
  }
});

// Add Card Analysis to "Maintain" in CAME
router.post("/maintain/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    const newAnalysis = new cardAnalysis(req.body);
    await newAnalysis.save();
    await cameAnalysis.maintain.push(newAnalysis._id); // Add card to the 'maintain' array
    await cameAnalysis.save();

    res.status(201).json({ message: `New analysis added to Maintain` });
  } catch (error) {
    console.error("Error adding analysis to Maintain in MongoDB:", error);
    res.status(500).json({ message: "Error adding analysis to Maintain in MongoDB" });
  }
});

// Add Card Analysis to "Explore" in CAME
router.post("/explore/addCardAnalysis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    const newAnalysis = new cardAnalysis(req.body);
    await newAnalysis.save();
    await cameAnalysis.explore.push(newAnalysis._id); // Add card to the 'explore' array
    await cameAnalysis.save();

    res.status(201).json({ message: `New analysis added to Explore` });
  } catch (error) {
    console.error("Error adding analysis to Explore in MongoDB:", error);
    res.status(500).json({ message: "Error adding analysis to Explore in MongoDB" });
  }
});

// Get all CAME Analysis for a Strategic Plan
router.get("/allAnalisis/:id", async (req, res) => {
  try {
    const { id } = req.params; // StrategicPlan ID
    const strategicPlan = await StrategicPlan.findById(id); // Find StrategicPlan by ID
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME) // Find CAME by ID in StrategicPlan
      .populate('correct')
      .populate('afront')
      .populate('maintain')
      .populate('explore');
      
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    res.json(cameAnalysis);
  } catch (error) {
    console.error("Error fetching CAME analysis:", error);
    res.status(500).json({ message: "Error fetching CAME analysis" });
  }
});

// Delete Card Analysis from "Correct" in CAME
router.post("/correct/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME); // Find CAME by ID in StrategicPlan
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    cameAnalysis.correct.pull(_id); // Remove cardAnalysis ID from correct array
    await cameAnalysis.save();

    await cardAnalysis.findByIdAndDelete(_id);

    res.status(200).json({ message: "Card deleted successfully from Correct" });
  } catch (error) {
    console.error("Error deleting card from Correct:", error);
    res.status(500).json({ message: "Error deleting card from Correct" });
  }
});

// Similar Delete routes for "Afront", "Maintain", and "Explore"
router.post("/afront/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME);
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    cameAnalysis.afront.pull(_id); // Remove cardAnalysis ID from afront array
    await cameAnalysis.save();

    await cardAnalysis.findByIdAndDelete(_id);

    res.status(200).json({ message: "Card deleted successfully from Afront" });
  } catch (error) {
    console.error("Error deleting card from Afront:", error);
    res.status(500).json({ message: "Error deleting card from Afront" });
  }
});

// Maintain and Explore delete routes follow the same pattern
router.post("/maintain/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME);
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    cameAnalysis.maintain.pull(_id); // Remove cardAnalysis ID from maintain array
    await cameAnalysis.save();

    await cardAnalysis.findByIdAndDelete(_id);

    res.status(200).json({ message: "Card deleted successfully from Maintain" });
  } catch (error) {
    console.error("Error deleting card from Maintain:", error);
    res.status(500).json({ message: "Error deleting card from Maintain" });
  }
});

router.post("/explore/deleteCard/:id", async (req, res) => {
  try {
    const { id } = req.params; // CAME ID
    const { _id } = req.body; // cardAnalysis ID to delete

    const strategicPlan = await StrategicPlan.findById(id);
    if (!strategicPlan) {
      return res.status(500).json({ message: "Strategic Plan not found" });
    }

    const cameAnalysis = await CAME.findById(strategicPlan.CAME);
    if (!cameAnalysis) {
      return res.status(500).json({ message: "CAME analysis not found" });
    }

    cameAnalysis.explore.pull(_id); // Remove cardAnalysis ID from explore array
    await cameAnalysis.save();

    await cardAnalysis.findByIdAndDelete(_id);

    res.status(200).json({ message: "Card deleted successfully from Explore" });
  } catch (error) {
    console.error("Error deleting card from Explore:", error);
    res.status(500).json({ message: "Error deleting card from Explore" });
  }
});

module.exports = router;
