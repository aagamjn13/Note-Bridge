const mongoose = require("mongoose");

const postLikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  isLiked: {
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
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: "like",
  },
});

const PostLike = mongoose.model('socialPostLike', postLikeSchema);

module.exports = PostLike;
