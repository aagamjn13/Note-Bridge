const express = require("express");
const router = express.Router();
const fetchuser = require("../middlewire/fetchUser");
const Folder = require("../models/folder");
const Note = require("../models/notes");
const deleteFolderRecursive = require("../firebase/deleteFolder");
require('dotenv').config();

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Handler for creating a new folder (supports both /creat and /create)
const createFolderHandler = async (req, res) => {
  try {
    if (req.body.user !== req.id) {
      return res.status(401).json({ error: true, message: "authentication denied" });
    }
    const name = (req.body.name || "").trim();
    if (!name) {
      return res.status(400).json({ error: true, message: "Folder name is required" });
    }

    const existFolder = await Folder.findOne({
      user: req.id,
      name,
      folderPath: req.body.folderPath,
    });
    if (existFolder !== null) {
      return res.json({
        error: true,
        message: `Folder with name : ${name} already exists`,
      });
    }

    const folder = new Folder({
      user: req.id,
      name,
      folderPath: req.body.folderPath,
    });
    await folder.save();
    return res.json({
      error: false,
      message: `Folder created successfully with name : ${name}`,
      folder,
    });
  } catch (error) {
    console.error("Create folder error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
};

router.post("/creat", fetchuser, createFolderHandler);
router.post("/create", fetchuser, createFolderHandler);

// Router for fetching folders of a particular user
router.put("/fetch", fetchuser, async (req, res) => {
  try {
    if (req.body.user !== req.id) {
      return res.status(401).json({ error: true, message: "authentication denied" });
    }
    const folders = await Folder.find({
      user: req.id,
      folderPath: req.body.folderPath,
    });
    if (folders.length !== 0) {
      return res.json({ error: false, folders });
    }
    return res.json({
      error: false,
      folders: [],
      message: "You have no folder in this section",
    });
  } catch (error) {
    console.error("Fetch folders error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Router for deleting folders
router.delete("/delete", fetchuser, async (req, res) => {
  try {
    if (req.body.user !== req.id) {
      return res.status(401).json({ error: true, message: "authentication denied" });
    }

    const folderIds = Array.isArray(req.body.folderId) ? req.body.folderId : [];
    for (let index = 0; index < folderIds.length; index++) {
      const folder = await Folder.findOne({ user: req.id, _id: folderIds[index] });
      if (!folder) continue;

      const folderPath = `${req.body.folderPath}/${folder.name}`.replace(/\/+/g, "/");
      const deletePath = `${req.id}/${req.body.folderPath}/${folder.name}`.replace(/\/+/g, "/");

      // Attempt recursive deletion in Firebase Storage
      try {
        await deleteFolderRecursive(deletePath);
      } catch (fbErr) {
        console.warn("Firebase folder deletion warning:", fbErr.message);
      }

      // Delete the root folder document
      await Folder.deleteOne({ user: req.id, _id: folder._id });

      // Delete all subfolders and notes inside this folder tree using regex
      const subPathRegex = new RegExp(`^${escapeRegex(folderPath)}(/|$)`);
      await Folder.deleteMany({ user: req.id, folderPath: subPathRegex });
      await Note.deleteMany({ user: req.id, folderPath: subPathRegex });
    }

    return res.json({ error: false, message: "Selected folder/folders are deleted successfully" });
  } catch (error) {
    console.error("Delete folder error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

module.exports = router;
