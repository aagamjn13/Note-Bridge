const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  originalname: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: "note",
  },
  type: {
    type: String,
    default: "file",
  },
  sizeinbytes: {
    type: Number,
  },
  url: {
    type: String,
  },
  extention: {
    type: String,
    default: "txt",
  },
  desc: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  folderPath: {
    type: String,
    required: true,
  },
});

const Note = mongoose.model("note", NoteSchema);

module.exports = Note;
