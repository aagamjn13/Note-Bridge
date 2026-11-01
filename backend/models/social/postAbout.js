const mongoose = require("mongoose");

const postAboutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const PostAbout = mongoose.model('socialPostAbout', postAboutSchema);

module.exports = PostAbout;
