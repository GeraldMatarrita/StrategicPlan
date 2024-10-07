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
        const {id} = req.params
        const checkCard = validateCardAnalysis(req.body)
        if(checkCard){
            return res.status(404).json({ message: "The analysis is not correct, verify card" });
        }
        const card = cardAnalysis.findById(id)
        if(!card){
            return res.status(404).json({ message: "Analisis no encontrado" });
        }
        card.save(req.body)
        res.status(201).json({
            message: `Analysis Updated `,
          });

    } catch (error) {
        console.error("Error al actualizar la carta de analisis:", error);
        res.status(500).json({
          message: "Error al actualizar la carta de analisis"
        });
    }
})
module.exports = router;
