const mongoose = require("mongoose");

const FollowReqSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  isreq: {
    type: Boolean,
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
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: "follow",
  },
});

const FollowReq = mongoose.model('socialFollowReq', FollowReqSchema);

module.exports = FollowReq;
