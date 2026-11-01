const mongoose = require("mongoose");

const postUploadSchema = new mongoose.Schema({
  folder: {
    type: Object,
  },
  file: {
    type: Object,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  folderPath: {
    type: String,
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
});

const PostUpload = mongoose.model('socialPost', postUploadSchema);

module.exports = PostUpload;
