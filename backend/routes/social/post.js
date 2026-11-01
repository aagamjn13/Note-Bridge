const express = require("express");
const router = express.Router();
const fetchuser = require("../../middlewire/fetchUser");
const Note = require("../../models/notes");
const User = require("../../models/auth");
const Post = require("../../models/social/postUpload");
const Folder = require("../../models/folder");
const About = require("../../models/social/postAbout");
const Like = require("../../models/social/postLike");
const View = require("../../models/social/viewReq");
const Follow = require("../../models/social/followReq");
const Comment = require("../../models/social/commentSave");
require('dotenv').config();

// Route 1: Post file(s)
router.post("/post/file/upload", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({ error: true, message: "authentication denied" });
    }
    const ids = Array.isArray(req.body.id) ? req.body.id : [];
    for (let index = 0; index < ids.length; index++) {
      const fileDoc = await Note.findOne({
        user: req.id,
        _id: ids[index],
      });
      if (fileDoc) {
        const newPost = new Post({
          file: fileDoc,
          user: req.id,
          type: "file",
          folderPath: req.body.folderPath,
          aboutId: req.body.aboutId,
        });
        await newPost.save();
      }
    }
    return res.json({ error: false, message: "Post successfully" });
  } catch (error) {
    console.error("Post file upload error:", error);
    return res.status(500).json({ error: true, message: "some error occured" });
  }
});

// Route 2: Post folder(s)
router.post("/post/folder/upload", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({ error: true, message: "authentication denied" });
    }

    const allFolders = await Folder.find({ user: req.id });
    const allFiles = await Note.find({ user: req.id });
    const folderIds = Array.isArray(req.body.id) ? req.body.id : [];

    for (let index = 0; index < folderIds.length; index++) {
      const folder = await Folder.findOne({
        user: req.id,
        _id: folderIds[index],
      });
      if (!folder) continue;

      const originalFolder = new Post({
        folder: folder,
        user: req.id,
        type: "folder",
        folderPath: req.body.folderPath,
        aboutId: req.body.aboutId,
      });
      await originalFolder.save();

      const folderPrefix = `${req.body.folderPath}/${folder.name}`;

      // Save inside folders
      for (let f = 0; f < allFolders.length; f++) {
        if (allFolders[f].folderPath && allFolders[f].folderPath.startsWith(folderPrefix)) {
          const postFolder = new Post({
            folder: allFolders[f],
            user: req.id,
            type: "folder",
            folderPath: allFolders[f].folderPath,
            aboutId: req.body.aboutId,
          });
          await postFolder.save();
        }
      }

      // Save inside files
      for (let fi = 0; fi < allFiles.length; fi++) {
        if (allFiles[fi].folderPath && allFiles[fi].folderPath.startsWith(folderPrefix)) {
          const postFile = new Post({
            file: allFiles[fi],
            user: req.id,
            type: "file",
            folderPath: allFiles[fi].folderPath,
            aboutId: req.body.aboutId,
          });
          await postFile.save();
        }
      }
    }

    return res.json({ error: false, message: "successful" });
  } catch (error) {
    console.error("Post folder upload error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 3: Upload about of post
router.post("/post/about", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    const aboutPost = new About({
      user: req.id,
      about: req.body.about,
    });
    await aboutPost.save();
    return res.json({ error: false, aboutId: aboutPost._id });
  } catch (error) {
    console.error("Post about error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 4: Fetch files for given aboutIds
router.put("/post/fetch", async (req, res) => {
  try {
    const aboutIds = Array.isArray(req.body.aboutId) ? req.body.aboutId : [];
    const allfiles = [];
    for (let index = 0; index < aboutIds.length; index++) {
      const files = await Post.find({
        type: "file",
        aboutId: aboutIds[index],
      });
      allfiles.push(files);
    }
    return res.json({ error: false, allfiles });
  } catch (error) {
    console.error("Post fetch error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 5: Fetch all about posts
router.put("/post/about/fetch", async (req, res) => {
  try {
    const about = await About.find({});
    return res.json({ error: false, about });
  } catch (error) {
    console.error("Post about fetch error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 6: Fetch user details by IDs without password (batch optimized)
router.put("/post/user/fetch", async (req, res) => {
  try {
    const ids = Array.isArray(req.body.id) ? req.body.id : [];
    const foundUsers = await User.find({ _id: { $in: ids } }).select("-password");
    const userMap = {};
    foundUsers.forEach((u) => {
      userMap[u._id.toString()] = u;
    });
    const users = ids.map((id) => userMap[id.toString()] || null);
    return res.json({ error: false, users });
  } catch (error) {
    console.error("Post user fetch error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 7: Submit like/unlike
router.post("/post/like/submit", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    if (req.body.isLiked === false) {
      const existing = await Like.findOne({ user: req.id, aboutId: req.body.aboutId });
      const id = existing ? existing._id : null;
      await Like.deleteOne({ user: req.id, aboutId: req.body.aboutId });
      return res.json({ error: false, message: "unlike successfully", id });
    }

    if (req.body.isLiked === true) {
      const existing = await Like.findOne({ user: req.id, aboutId: req.body.aboutId });
      if (existing) {
        return res.json({ error: false, newLike: existing });
      }
      const newLike = new Like({
        user: req.id,
        isLiked: req.body.isLiked,
        aboutId: req.body.aboutId,
        userId: req.body.userId,
      });
      await newLike.save();
      return res.json({ error: false, newLike });
    }
  } catch (error) {
    console.error("Post like submit error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 8: Fetch all likes of a user
router.put("/post/like/fetch", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    const allLikes = await Like.find({ user: req.id });
    return res.json({ error: false, allLikes });
  } catch (error) {
    console.error("Post like fetch error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 9: Fetch all likes of given posts (batch optimized)
router.put("/post/like/about/fetch", async (req, res) => {
  try {
    const aboutIds = Array.isArray(req.body.aboutId) ? req.body.aboutId : [];
    const allLikes = [];
    for (let index = 0; index < aboutIds.length; index++) {
      const likes = await Like.find({ aboutId: aboutIds[index] });
      allLikes.push(likes);
    }
    return res.json({ error: false, allLikes });
  } catch (error) {
    console.error("Post like about fetch error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 10: View request
router.post("/post/view/req/post", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    if (req.body.isreq === false) {
      const existing = await View.findOne({ user: req.id, aboutId: req.body.aboutId, isRejected: false });
      const id = existing ? existing._id : null;
      await View.deleteOne({ user: req.id, aboutId: req.body.aboutId, isRejected: false });
      return res.json({
        error: false,
        message: "request cancel successfully",
        id,
      });
    }

    if (req.body.isreq === true) {
      const oldReq = await View.findOne({
        user: req.id,
        aboutId: req.body.aboutId,
        isRejected: false,
      });
      if (oldReq) {
        return res.json({ error: false, newReq: oldReq });
      }

      const newReq = new View({
        user: req.id,
        isreq: req.body.isreq,
        aboutId: req.body.aboutId,
        userId: req.body.userId,
        isRejected: false,
      });
      await newReq.save();
      return res.json({ error: false, newReq });
    }
  } catch (error) {
    console.error("Post view req error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 11: Get all view requests for a user
router.put("/post/view/get", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    const allViewReq = await View.find({ user: req.id, isRejected: false });
    return res.json({ error: false, allViewReq });
  } catch (error) {
    console.error("Post view get error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 12: Follow / Unfollow request
router.post("/post/follow/req", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    const followingId = req.body.userId;

    if (req.body.isreq === false) {
      const existing = await Follow.findOne({ followerId: req.id, followingId: followingId });
      if (existing) {
        await Follow.deleteOne({ followerId: req.id, followingId: followingId });
        return res.json({ error: false, message: "unfollow successfully", id: existing._id });
      }
      return res.json({ error: false, message: "unfollow successfully", id: null });
    }

    if (req.body.isreq === true) {
      const exist = await Follow.findOne({
        followerId: req.id,
        followingId: followingId,
        isRejected: false,
      });
      if (exist) {
        return res.json({ error: false, newReq: exist });
      }
      const newReq = new Follow({
        followerId: req.id,
        followingId: followingId,
        isreq: req.body.isreq,
        isRejected: false,
      });
      await newReq.save();
      return res.json({ error: false, newReq });
    }
  } catch (error) {
    console.error("Post follow req error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 13: Fetch follow requests for a user
router.put("/post/follow/get", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    const allFollow = await Follow.find({
      followerId: req.id,
      isRejected: false,
    });
    return res.json({ error: false, allFollow });
  } catch (error) {
    console.error("Post follow get error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 14: Save comment
router.post("/post/comment/post", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    const newComment = new Comment({
      user: req.id,
      comment: req.body.comment,
      aboutId: req.body.aboutId,
      userId: req.body.userId,
    });
    await newComment.save();
    return res.json({ error: false, newComment });
  } catch (error) {
    console.error("Post comment save error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Route 15: Fetch comments for given aboutIds
router.put("/post/comment/get", async (req, res) => {
  try {
    const aboutIds = Array.isArray(req.body.aboutId) ? req.body.aboutId : [];
    const allComments = [];
    for (let index = 0; index < aboutIds.length; index++) {
      const comments = await Comment.find({ aboutId: aboutIds[index] }).sort({ date: -1 });
      allComments.push(comments);
    }
    return res.json({ error: false, allComments });
  } catch (error) {
    console.error("Post comment get error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

module.exports = router;
