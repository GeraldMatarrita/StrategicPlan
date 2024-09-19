const router = require("express").Router();

const {cardAnalysis, validateCardAnalysis} = require("../Models/cardAnalysis")
const CAME = require("../Models/came")
const {StrategicPlan,validateStrategicPlan} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel


/**
 * función que obtiene las todos las descripciones con titulo de el analisis MECA
 * @param {String} strategicPlanId - ID del usuario
 * @returns {Object} - MECA analisis
 * @throws {Object} - Mensaje de error
 */
router.get("/came/:id",async (req,res)=> {
    try {
        const { id } = req.params; // Obtener el ID del parámetro de la URL
        const strategicPlan = await StrategicPlan.findById(id).populate(
          "members_ListIDS"
        );
        if (!strategicPlan) {
          return res
            .status(404)
            .json({ message: "StrategicPlanModel no encontrado" });
        }
        res.json(strategicPlan);
      } catch (error) {
        console.error(
          "Error al consultar la colección StrategicPlanModel en MongoDB:",
          error
        );
        res.status(500).json({
          message: "Error al consultar la colección StrategicPlanModel en MongoDB",
        });
      }
})