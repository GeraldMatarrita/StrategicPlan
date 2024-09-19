const mongoose = require("mongoose");
const Joi = require("joi");

const cardsAnalysisSchema = new mongoose.Schema({
  title: String,
  description:String
})


const validateCardAnalysis =(data)=>{
    const schema = data.object({
        title: Joi.string().min(4).max(200).optional().label("title"),
        description: Joi.string().min(5).max(1000).optional().label("description")
    });
    return schema.validate(data);
}

const cardAnalysis= mongoose.model("cardAnalysis", cardsAnalysisSchema);

// Exportación del modelo y la función de validación
module.exports = {cardAnalysis, validateCardAnalysis };
