const mongoose = require("mongoose");

const viewReqSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  isreq: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  aboutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "socialPostAbout",
    required: true,
  },
  isaccept: {
    type: Boolean,
    default: false,
  },
  isRejected: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: "view",
  },
});

const viewReq = mongoose.model('socialViewReq', viewReqSchema);

module.exports = viewReq;
