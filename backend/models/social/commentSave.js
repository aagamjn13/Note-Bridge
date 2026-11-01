const mongoose = require("mongoose");

const commentSaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  comment: {
    type: String,
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
    default: "comment",
  },
});

const commentSave = mongoose.model('socialcomment', commentSaveSchema);

module.exports = commentSave;
