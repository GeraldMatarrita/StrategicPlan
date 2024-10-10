const router = require("express").Router();

const {cardAnalysis, validateCardAnalysis} = require("../Models/cardAnalysis")
const SWOT = require("../Models/swot")
const {StrategicPlan} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel


router.post("/strengths/addCardAnalysis/:id",async (req,res)=> {
    try {
        const { id } = req.params; // Obtener el ID del parámetro de la URL
        console.log(id)
        const strategicPlan = await StrategicPlan.findById(id)
        console.log(strategicPlan)
        if (!strategicPlan) {
          return res
            .status(500)
            .json({ message: "StrategicPlanModel no encontrado" });
        }
        console.log(strategicPlan.SWOT)
        const swotAnalisis = await SWOT.findById(strategicPlan.SWOT)
        console.log(swotAnalisis)
        if(!swotAnalisis){
          return res.status(500).json({message:"Analisis FODA no encontrado"})
        }
       /*const {err} = validateCardAnalysis(req.body)
        if(err){
          return res
            .status(500)
            .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
        }*/


        const newAnalisis = new cardAnalysis(req.body)
        await newAnalisis.save()
        await swotAnalisis.strengths.push(newAnalisis._id)
        await swotAnalisis.save()

        
        res.status(201).json({
          message: `New analisis added`,
        });

      } catch (error) {
        console.error(
          "Error al insertar el nuevo analisis en MongoDB:",
          error
        );
        res.status(404).json({
          message: "Error al consultar la colección de FODA en MongoDB",
        });
      }

})

router.post("/weaknesses/addCardAnalysis/:id",async (req,res)=> {
  try {
    const { id } = req.params; // Obtener el ID del parámetro de la URL
    console.log(id)
    const strategicPlan = await StrategicPlan.findById(id)
    console.log(strategicPlan)
    if (!strategicPlan) {
      return res
        .status(500)
        .json({ message: "StrategicPlanModel no encontrado" });
    }
    console.log(strategicPlan.SWOT)
    const swotAnalisis = await SWOT.findById(strategicPlan.SWOT)
    console.log(swotAnalisis)
    if(!swotAnalisis){
      return res.status(500).json({message:"Analisis FODA no encontrado"})
    }
   /*const {err} = validateCardAnalysis(req.body)
    if(err){
      return res
        .status(500)
        .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
    }*/


    const newAnalisis = new cardAnalysis(req.body)
    await newAnalisis.save()
    await swotAnalisis.weaknesses.push(newAnalisis._id)
    await swotAnalisis.save()

    
    res.status(201).json({
      message: `New analisis added`,
    });

  } catch (error) {
    console.error(
      "Error al insertar el nuevo analisis en MongoDB:",
      error
    );
    res.status(404).json({
      message: "Error al consultar la colección de FODA en MongoDB",
    });
  }

})

router.post("/opportunities/addCardAnalysis/:id",async (req,res)=> {
  try {
    const { id } = req.params; // Obtener el ID del parámetro de la URL
    console.log(id)
    const strategicPlan = await StrategicPlan.findById(id)
    console.log(strategicPlan)
    if (!strategicPlan) {
      return res
        .status(500)
        .json({ message: "StrategicPlanModel no encontrado" });
    }
    console.log(strategicPlan.SWOT)
    const swotAnalisis = await SWOT.findById(strategicPlan.SWOT)
    console.log(swotAnalisis)
    if(!swotAnalisis){
      return res.status(500).json({message:"Analisis FODA no encontrado"})
    }
   /*const {err} = validateCardAnalysis(req.body)
    if(err){
      return res
        .status(500)
        .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
    }*/


    const newAnalisis = new cardAnalysis(req.body)
    await newAnalisis.save()
    await swotAnalisis.opportunities.push(newAnalisis._id)
    await swotAnalisis.save()

    
    res.status(201).json({
      message: `New analisis added`,
    });

  } catch (error) {
    console.error(
      "Error al insertar el nuevo analisis en MongoDB:",
      error
    );
    res.status(404).json({
      message: "Error al consultar la colección de FODA en MongoDB",
    });
  }
})

router.post("/threats/addCardAnalysis/:id",async (req,res)=> {
  try {
    const { id } = req.params; // Obtener el ID del parámetro de la URL
    const strategicPlan = await StrategicPlan.findById(id)
    if (!strategicPlan) {
      return res
        .status(500)
        .json({ message: "StrategicPlanModel no encontrado" });
    }
    const swotAnalisis = await SWOT.findById(strategicPlan.SWOT)
    if(!swotAnalisis){
      return res.status(500).json({message:"Analisis FODA no encontrado"})
    }
   /*const {err} = validateCardAnalysis(req.body)
    if(err){
      return res
        .status(500)
        .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
    }*/


    const newAnalisis = new cardAnalysis(req.body)
    await newAnalisis.save()
    await swotAnalisis.threats.push(newAnalisis._id)
    await swotAnalisis.save()

    
    res.status(201).json({
      message: `New analisis added`,
    });

  } catch (error) {
    console.error(
      "Error al insertar el nuevo analisis en MongoDB:",
      error
    );
    res.status(404).json({
      message: "Error al consultar la colección de FODA en MongoDB",
    });
  }
})

router.get("/allAnalisis/:id",async (req,res)=>{
  try{
      const { id } = req.params; // Obtener el ID del parámetro de la URL
      const strategicPlan = await StrategicPlan.findById(id)
      if (!strategicPlan) {
        return res
          .status(500)
          .json({ message: "StrategicPlanModel no encontrado" });
      }

      const swotAnalisis = await SWOT.findById(strategicPlan.SWOT)
      if(!swotAnalisis){
        return res.status(500).json({message:"Analisis FODA no encontrado"})
      }

      SWOT.findById(strategicPlan.SWOT)
            .populate('strengths')
            .populate('weaknesses')
            .populate('opportunities')
            .populate('threats')
            .then(
              swot =>{
                console.log(swot)
                res.json(swot)
                } 
              )
            .catch(error => console.error(error)
            )
      
  }
  catch (error) {
    console.error(
      "Error al obtener los datos del analisis MECA:",
      error
    );
    res.status(404).json({
      message: "Error al obtener los datos del analisis MECA",
    });
  }
})
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



router.post("/threats/deleteCard/:id",async (req,res)=>{
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
    
  }
)

module.exports = router;