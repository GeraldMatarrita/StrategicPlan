const router = require("express").Router();

const {cardAnalysis, validateCardAnalysis} = require("../Models/cardAnalysis")
const CAME = require("../Models/came")
const {StrategicPlan} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel


/**
 * Funcion para crear el una carta de analisis en el analisis MECA
 * @param {String} strategicPlanId - ID del plan estrategico
 * @returns {Object} - MECA analisis
 * @throws {Object} - Mensajes de error
 */
router.post("/correct/addCardAnalysis/:id",async (req,res)=> {
    try {
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

        const {error} = validateCardAnalysis(req.body)
        if(error){
          return res
            .status(500)
            .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
        }


        const newAnalisis = new cardAnalysis(req.body)
        newAnalisis.save()
        cameAnalisis.correct.push(newAnalisis._id)
        cameAnalisis.save()

        
        res.status(201).json({
          message: `New analisis added`,
        });

      } catch (error) {
        console.error(
          "Error al insertar el nuevo analisis en MongoDB:",
          error
        );
        res.status(404).json({
          message: "Error al consultar la colección de MECA en MongoDB",
        });
      }

})

router.post("/adapt/addCardAnalysis/:id",async (req,res)=> {
  try {
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

      const {error} = validateCardAnalysis(req.body)
      if(error){
        return res
          .status(500)
          .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
      }

      
      const newAnalisis = new cardAnalysis(req.body)
      newAnalisis.save()
      cameAnalisis.afront.push(newAnalisis._id)
      cameAnalisis.save()
      res.status(201).json({
        message: `New analisis added`,
      });
      
    } catch (error) {
      console.error(
        "Error al insertar el nuevo analisis en MongoDB:",
        error
      );
      res.status(404).json({
        message: "Error al consultar la colección de MECA en MongoDB",
      });
    }

})
router.post("/maintain/addCardAnalysis/:id",async (req,res)=> {
  try {
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

      const {error} = validateCardAnalysis(req.body)
      if(error){
        return res
          .status(500)
          .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
      }

      
      const newAnalisis = new cardAnalysis(req.body)
      newAnalisis.save()
      cameAnalisis.maintain.push(newAnalisis._id)
      cameAnalisis.save()
      res.status(201).json({
        message: `New analisis added`,
      });
      
    } catch (error) {
      console.error(
        "Error al insertar el nuevo analisis en MongoDB:",
        error
      );
      res.status(404).json({
        message: "Error al consultar la colección de MECA en MongoDB",
      });
    }

})
router.post("/explore/addCardAnalysis/:id",async (req,res)=> {
  try {
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

      const {error} = validateCardAnalysis(req.body)
      if(error){
        return res
          .status(500)
          .json({ message: "Datos del card analisis mal ingresados, revisa los datos" });
      }

      
      const newAnalisis = new cardAnalysis(req.body)
      newAnalisis.save()
      cameAnalisis.explore.push(newAnalisis._id)
      cameAnalisis.save()
      res.status(201).json({
        message: `New analisis added`,
      });
      
    } catch (error) {
      console.error(
        "Error al insertar el nuevo analisis en MongoDB:",
        error
      );
      res.status(404).json({
        message: "Error al consultar la colección de MECA en MongoDB",
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

      CAME.findById(cameId)
            .populate('correct')
            .populate('face')
            .populate('maintain')
            .populate('exploit')
            .then(came => res.json(came))
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

router.post("/correct/deleteCard/:id",async (req,res)=>{
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
    await CAME.findByIdAndUpdate(strategicPlanId,{
      $pull:{correct:{idCard}}
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

router.post("/adapt/deleteCard/:id",async (req,res)=>{
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
    await CAME.findByIdAndUpdate(strategicPlanId,{
      $pull:{afront:{idCard}}
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

router.post("/maintain/deleteCard/:id",async (req,res)=>{
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
    await CAME.findByIdAndUpdate(strategicPlanId,{
      $pull:{maintain:{idCard}}
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



router.post("/explore/deleteCard/:id",async (req,res)=>{
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
    await CAME.findByIdAndUpdate(strategicPlanId,{
      $pull:{explore:{idCard}}
    })
    //Borrar de la base de datos el cardAnalysis
    await cardAnalysis.findByIdAndDelete(idCard)

  } catch (error) {
    console.error(
      "Error al obtener los datos del analisis MECA",
      error
    );
    res.status(404).json({
      message: "Error al obtener los datos del analisis MECA",
    });
  }
})

module.exports = router;