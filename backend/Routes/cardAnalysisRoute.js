const router = require("express").Router()
const {cardAnalysis, validateCardAnalysis} = require("../Models/cardAnalysis")

router.get("/getCard/:id",async (req,res)=>{
    try{
        const { id } = req.params
        const card = cardAnalysis.findById(id)
        if(!card){
            return res.status(404).json({ message: "Analisis no encontrado" });
        }
        res.json(card)
    }
    catch (error) {
        console.error("Error al consultar la carta de analisis :", error);
        res.status(500).json({
          message: "Error al consultar la carta de analisis"
        });
    }
})

router.put("/updateCard/:id", async (req,res)=>{
    try {
        const { id } = req.params;
        console.log(id)
        const updatedCardData = req.body;


        const updatedCard = await cardAnalysis.findByIdAndUpdate(
            id,
            updatedCardData,
            { new: true } 
        );

        if (!updatedCard) {
            return res.status(404).json({ message: "Análisis no encontrado" });
        }

        res.status(200).json({
            message: "Análisis actualizado",
            card: updatedCard
        });
    } catch (error) {
        console.error("Error al actualizar la carta de análisis:", error);
        res.status(500).json({
            message: "Error al actualizar la carta de análisis"
        });
    }
})
module.exports = router;
