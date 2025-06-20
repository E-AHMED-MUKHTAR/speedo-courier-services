const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  waybill: String,
  sender: String,
  receiver: String,
  shipping: Number,
  commission: Number,
  total: Number,
  profit: Number,
  collectionName: Number,
  supply: Number,
  weight: Number,
  type: String,
  typeColor: String,
  fuel: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", reportSchema);
