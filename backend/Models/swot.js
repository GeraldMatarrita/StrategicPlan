const mongoose = require("mongoose");

const swotSchema = new mongoose.Schema({
  
  strengths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],
  weaknesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],
  opportunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],
  threats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],
});

const SWOT = mongoose.model('SWOT', swotSchema);

module.exports = SWOT;

