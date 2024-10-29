const mongoose = require("mongoose");

const cameSchema = new mongoose.Schema({
  correct: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],
  afront: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],
  maintain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],
  explore: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cardAnalysis' }],

});

const CAME = mongoose.model('CAME', cameSchema);
module.exports = CAME;