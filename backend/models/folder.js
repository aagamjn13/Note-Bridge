const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  folderPath: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "folder",
  },
});

const Folder = mongoose.model("folder", folderSchema);

module.exports = Folder;
