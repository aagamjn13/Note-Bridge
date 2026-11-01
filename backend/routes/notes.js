const express = require("express");
const fs = require("fs");
const Note = require("../models/notes");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middlewire/fetchUser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require('dotenv').config();

const JWTserect = process.env.JWT_MESSAGE;

// Multer middleware for handling multipart file upload
const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB safety limit
});

// Helper to remove temporary files created on disk by multer
const cleanupFiles = (files) => {
  if (Array.isArray(files)) {
    files.forEach((file) => {
      if (file && file.path) {
        fs.unlink(file.path, () => {});
      }
    });
  }
};

// Route 1: Upload text notes to MongoDB
router.post(
  "/text/upload",
  [body("originalname").isLength({ min: 1 }), body("desc").isLength({ min: 3 })],
  fetchuser,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array(), message: "Too small inputs" });
    }
    try {
      if (req.body.user !== req.id) {
        return res.status(401).json({ error: true, message: "authentication denied" });
      }
      const isexist = await Note.findOne({
        user: req.id,
        originalname: req.body.originalname,
        folderPath: req.body.folderPath,
      });
      if (isexist) {
        return res.json({
          message: `file already exists with originalname ${req.body.originalname}`,
          error: true,
        });
      }

      const file = new Note({
        extention: "txt",
        user: req.id,
        type: "text",
        originalname: req.body.originalname,
        desc: req.body.desc,
        tag: req.body.tag || "note",
        folderPath: req.body.folderPath,
      });
      await file.save();
      return res.json({ file, error: false, message: "Note created successfully" });
    } catch (error) {
      console.error("Note upload error:", error);
      return res.status(500).json({ error: true, message: "some error occured" });
    }
  }
);

// Route 2: Fetch all notes for a user by folderPath
router.get("/fetch", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.header("user")) {
      return res.status(401).json({ error: true, message: "authentication denied" });
    }
    const file = await Note.find({
      user: req.id,
      folderPath: req.header("folderPath"),
    });
    return res.json({ file: file || [] });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return res.status(500).json({ error: true, message: "some error occured" });
  }
});

// Route 3: Delete notes of a user by IDs
router.put("/delete", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({ error: true, message: "authentication denied", status: 401 });
    }
    const ids = Array.isArray(req.body.id) ? req.body.id : [];
    const fileNameArray = [];
    const typeArray = [];

    for (let index = 0; index < ids.length; index++) {
      const file = await Note.findOne({
        user: req.id,
        folderPath: req.body.folderPath,
        _id: ids[index],
      });
      if (file) {
        fileNameArray.push(file.originalname);
        typeArray.push(file.type);
        await Note.deleteOne({ user: req.id, _id: ids[index], folderPath: req.body.folderPath });
      }
    }

    return res.json({
      message: "Selected notes are deleted successfully",
      filename: fileNameArray,
      type: typeArray,
    });
  } catch (error) {
    console.error("Delete notes error:", error);
    return res.status(500).json({ error: true, message: "some error occured" });
  }
});

// Route 4: Upload files metadata after Firebase upload
router.post("/file/upload", upload.array("file"), async (req, res) => {
  try {
    // Validate auth token
    const token = req.body.authToken || req.header("authToken");
    if (!token) {
      cleanupFiles(req.files);
      return res.status(401).json({ error: true, message: "authentication denied" });
    }
    let verified;
    try {
      verified = jwt.verify(token, JWTserect);
    } catch {
      cleanupFiles(req.files);
      return res.status(401).json({ error: true, message: "invalid token" });
    }
    if (verified.id !== req.body.user) {
      cleanupFiles(req.files);
      return res.status(401).json({ error: true, message: "authentication denied" });
    }

    const fileurl = [];
    for (const key in req.body) {
      if (key.startsWith("url")) {
        fileurl.push(req.body[key]);
      }
    }

    const files = req.files || [];
    let anyAlreadyExists = false;

    for (let index = 0; index < files.length; index++) {
      const originalname = files[index].originalname;
      const existFile = await Note.findOne({
        originalname,
        user: req.body.user,
        folderPath: req.body.folderPath,
      });

      if (existFile === null) {
        const extParts = originalname.split(".");
        const ext = extParts.length > 1 ? extParts[extParts.length - 1] : "file";
        const fileDoc = new Note({
          user: req.body.user,
          originalname,
          sizeinbytes: files[index].size,
          url: fileurl[index] || "",
          extention: ext,
          tag: req.body.tag || "file",
          type: "file",
          folderPath: req.body.folderPath,
        });
        await fileDoc.save();
      } else {
        anyAlreadyExists = true;
      }
    }

    // Always clean up uploaded files from temporary disk storage
    cleanupFiles(req.files);

    if (anyAlreadyExists && files.length === 1) {
      return res.json({ error: true, message: "File already exists " });
    }
    return res.json({ error: false, message: "File/Files uploaded successfully!" });
  } catch (error) {
    cleanupFiles(req.files);
    console.error("File upload error:", error);
    return res.status(500).json({ error: true, message: "some error occured" });
  }
});

module.exports = router;
