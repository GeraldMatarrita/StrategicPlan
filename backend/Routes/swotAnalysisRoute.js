const router = require("express").Router();

const {cardAnalysis, validateCardAnalysis} = require("../Models/cardAnalysis")
const SWOT = require("../Models/swot")
const {StrategicPlan} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel


router.post("/strengths/addCardAnalysis/:id",async (req,res)=> {
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

        const {error} = validateCardAnalysis(req.body)
        if(error){
          return res
            .status(500)
            .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
        }


        const newAnalisis = new cardAnalysis(req.body)
        newAnalisis.save()
        swotAnalisis.strengths.push(newAnalisis._id)
        swotAnalisis.save()

        
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

        const {error} = validateCardAnalysis(req.body)
        if(error){
          return res
            .status(500)
            .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
        }


        const newAnalisis = new cardAnalysis(req.body)
        newAnalisis.save()
        swotAnalisis.weaknesses.push(newAnalisis._id)
        swotAnalisis.save()

        
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

        const {error} = validateCardAnalysis(req.body)
        if(error){
          return res
            .status(500)
            .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
        }


        const newAnalisis = new cardAnalysis(req.body)
        newAnalisis.save()
        swotAnalisis.opportunities.push(newAnalisis._id)
        swotAnalisis.save()

        
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

        const {error} = validateCardAnalysis(req.body)
        if(error){
          return res
            .status(500)
            .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
        }


        const newAnalisis = new cardAnalysis(req.body)
        newAnalisis.save()
        swotAnalisis.threats.push(newAnalisis._id)
        swotAnalisis.save()

        
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

      const cameAnalisis = await CAME.findById(strategicPlan.CAME)
      if(!cameAnalisis){
        return res.status(500).json({message:"Analisis MECA no encontrado"})
      }

      SWOT.findById(strategicPlan.SWOT)
            .populate('strengths')
            .populate('weaknesses')
            .populate('opportunities')
            .populate('threats')
            .then(swot => res.json(swot))
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


router.post("/strengths/deleteCard/:id",async (req,res)=>{
  try {
    const {id} = req.params;
    const strategicPlanId = await StrategicPlan.findById(id)
    if(!strategicPlan){
      return res
          .status(500)
          .json({ message: "StrategicPlanModel no encontrado" });
    }

    const {idCard} = req.body
    //Borrar de la lista el cardAnalysis
    await SWOT.findByIdAndUpdate(strategicPlanId,{
      $pull:{strengths:{idCard}}
    })
    //Borrar de la base de datos el cardAnalysis
    await cardAnalysis.findByIdAndDelete(idCard)

  } catch (error) {
    console.error(
      "Error al obtener los datos del analisis MECA:",
      error
    );
    res.status(404).json({
      message: "Error al obtener los datos del analisis MECA",
    });
  }
})

router.post("/weaknesses/deleteCard/:id",async (req,res)=>{
  try {
    const {id} = req.params;
    const strategicPlanId = await StrategicPlan.findById(id)
    if(!strategicPlan){
      return res
          .status(500)
          .json({ message: "StrategicPlanModel no encontrado" });
    }

    const {idCard} = req.body
    //Borrar de la lista el cardAnalysis
    await SWOT.findByIdAndUpdate(strategicPlanId,{
      $pull:{weaknesses:{idCard}}
    })
    //Borrar de la base de datos el cardAnalysis
    await cardAnalysis.findByIdAndDelete(idCard)

  } catch (error) {
    console.error(
      "Error al obtener los datos del analisis MECA:",
      error
    );
    res.status(404).json({
      message: "Error al obtener los datos del analisis MECA",
    });
  }
})


router.post("/opportunities/deleteCard/:id",async (req,res)=>{
  try {
    const {id} = req.params;
    const strategicPlanId = await StrategicPlan.findById(id)
    if(!strategicPlan){
      return res
          .status(500)
          .json({ message: "StrategicPlanModel no encontrado" });
    }

    const {idCard} = req.body
    //Borrar de la lista el cardAnalysis
    await SWOT.findByIdAndUpdate(strategicPlanId,{
      $pull:{opportunities:{idCard}}
    })
    //Borrar de la base de datos el cardAnalysis
    await cardAnalysis.findByIdAndDelete(idCard)

  } catch (error) {
    console.error(
      "Error al obtener los datos del analisis MECA:",
      error
    );
    res.status(404).json({
      message: "Error al obtener los datos del analisis MECA",
    });
  }
})

router.post("/opportunities/deleteCard/:id",async (req,res)=>{
  try {
    const {id} = req.params;
    const strategicPlanId = await StrategicPlan.findById(id)
    if(!strategicPlan){
      return res
          .status(500)
          .json({ message: "StrategicPlanModel no encontrado" });
    }

    const {idCard} = req.body
    //Borrar de la lista el cardAnalysis
    await SWOT.findByIdAndUpdate(strategicPlanId,{
      $pull:{opportunities:{idCard}}
    })
    //Borrar de la base de datos el cardAnalysis
    await cardAnalysis.findByIdAndDelete(idCard)

  } catch (error) {
    console.error(
      "Error al obtener los datos del analisis MECA:",
      error
    );
    res.status(404).json({
      message: "Error al obtener los datos del analisis MECA",
    });
  }
})


router.post("/threats/deleteCard/:id",async (req,res)=>{
  try {
    const {id} = req.params;
    const strategicPlanId = await StrategicPlan.findById(id)
    if(!strategicPlan){
      return res
          .status(500)
          .json({ message: "StrategicPlanModel no encontrado" });
    }

    const {idCard} = req.body
    //Borrar de la lista el cardAnalysis
    await SWOT.findByIdAndUpdate(strategicPlanId,{
      $pull:{threats:{idCard}}
    })
    //Borrar de la base de datos el cardAnalysis
    await cardAnalysis.findByIdAndDelete(idCard)

  } catch (error) {
    console.error(
      "Error al obtener los datos del analisis MECA:",
      error
    );
    res.status(404).json({
      message: "Error al obtener los datos del analisis MECA",
    });
  }
})
