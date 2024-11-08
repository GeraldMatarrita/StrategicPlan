const express = require("express");
const router = express.Router();
const { OperationalPlan, validateOperationalPlan } = require("../Models/OperationalModel");
const { StrategicPlan } = require("../Models/StrategicPlanModel");
const { Indicator } = require("../Models/IndicatorModel");
const { Activity } = require("../Models/ActivityModel");

// Get an Operational Plan by ID
router.get("/getOperationalPlan/:id", async (req, res) => {
  try {
    const plan = await OperationalPlan.findById(req.params.id);
    if (!plan) return res.status(404).send("Operational plan not found.");
    res.send(plan);
  } catch (error) {
    res.status(500).send("Server error while fetching operational plan.");
  }
});

router.get("/getOperationalPlansByStrategicPlanId/:id", async (req, res) => {
  try {
    console.log("Entra a getOperationalPlanByStrategicPlanId");
    const strategicPlan = await StrategicPlan.findById(req.params.id).populate("operationPlan_ListIDS");
    const plans = strategicPlan.operationPlan_ListIDS;
    console.log("plans", plans);
    if (!plans) return res.status(404).send("Operational plan not found.");
    res.send(plans);
  } catch (error) {
    res.status(500).send("Server error while fetching operational plan.");
  }
});

// Get the active Operational Plan (active: true)
router.get("/active", async (req, res) => {
  try {
    const activePlan = await OperationalPlan.findOne({ active: true });
    if (!activePlan) return res.status(404).send("No active operational plan found.");
    res.send(activePlan);
  } catch (error) {
    res.status(500).send("Server error while fetching active operational plan.");
  }
});

// Get all inactive Operational Plans (active: false)
router.get("/getOperationalPlans", async (req, res) => {
  try {
    const inactivePlans = await OperationalPlan.find();
    res.send(inactivePlans);
  } catch (error) {
    res.status(500).send("Server error while fetching inactive operational plans.");
  }
});

// Create a new Operational Plan
router.post("/create/:strategicPlanId", async (req, res) => {
  const { error } = validateOperationalPlan(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const strategicPlanId = req.params.strategicPlanId;
    const newPlanData = req.body;

    // Crear el nuevo Operational Plan
    const newOperationalPlan = new OperationalPlan(newPlanData);
    await newOperationalPlan.save();

    // Obtener el Strategic Plan
    const strategicPlan = await StrategicPlan.findById(strategicPlanId).populate("operationPlan_ListIDS");

    if (!strategicPlan) return res.status(404).send("Strategic Plan not found");

    // Obtener el último Operational Plan en el Strategic Plan (si existe)
    const lastOperationalPlan = strategicPlan.operationPlan_ListIDS.slice(-1)[0];

    if (lastOperationalPlan) {
      // Copiar el último indicador de cada actividad en el último Operational Plan
      const indicatorsToCopy = await Indicator.find({ operationalPlanId: lastOperationalPlan._id });
      
      for (const indicator of indicatorsToCopy) {
        const indicatorData = indicator.toObject();
        delete indicatorData._id; // Eliminar _id para evitar duplicados
        delete indicatorData.evidence; // Eliminar evidencia para evitar duplicados

        // Crear el nuevo indicador con los datos del último indicador
        const newIndicator = new Indicator({
          ...indicatorData,
          actual: 0, // Reiniciar el valor de 'actual'
          operationalPlanId: newOperationalPlan._id, // Asociar al nuevo Operational Plan
        });
        
        await newIndicator.save(); // Guardar el nuevo indicador

        // Actualizar la Activity correspondiente para añadir el nuevo indicator ID
        await Activity.findByIdAndUpdate(
          indicator.activityId,
          { $push: { indicators_ListIDS: newIndicator._id } },
          { new: true }
        );
      }
    }

    // Guardar el nuevo Operational Plan en el Strategic Plan
    strategicPlan.operationPlan_ListIDS.push(newOperationalPlan._id);

    await strategicPlan.save();

    res.send({ message: "Operational Plan created successfully", id: newOperationalPlan._id });
  } catch (err) {
    console.error("Error creating Operational Plan:", err);
    res.status(500).send("Error creating Operational Plan");
  }
});

// Set an Operational Plan to inactive
router.patch("/inactivate/:id", async (req, res) => {
  try {
    const plan = await OperationalPlan.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!plan) return res.status(404).send("Operational plan not found.");
    res.send(plan);
  } catch (error) {
    res.status(500).send("Server error while setting operational plan to inactive.");
  }
});

// Update an Operational Plan
router.put("/update/:id", async (req, res) => {
  try {
    const updatedPlan = await OperationalPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPlan) return res.status(404).send("Operational plan not found.");
    res.send(updatedPlan);
  } catch (error) {
    res.status(500).send("Server error while updating operational plan.");
  }
});

module.exports = router;
