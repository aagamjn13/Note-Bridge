const express = require("express");
const router = express.Router();
const fetchuser = require("../../middlewire/fetchUser");
const User = require("../../models/auth");
const Like = require("../../models/social/postLike");
const View = require("../../models/social/viewReq");
const Follow = require("../../models/social/followReq");
const Comment = require("../../models/social/commentSave");
require("dotenv").config();

// Router to fetch all notifications (batch-optimized to eliminate N+1 queries)
router.post("/get", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    const [AllLikes, allFollowReq, allViewReq, allComment] = await Promise.all([
      Like.find({ userId: req.id }),
      Follow.find({ followingId: req.id }),
      View.find({ userId: req.id }),
      Comment.find({ userId: req.id }),
    ]);

    // Collect all unique user IDs needed across notifications
    const userIdsSet = new Set();
    AllLikes.forEach((l) => {
      if (l.user && l.user.toString() !== req.id) userIdsSet.add(l.user.toString());
    });
    allFollowReq.forEach((f) => {
      if (f.followerId) userIdsSet.add(f.followerId.toString());
    });
    allViewReq.forEach((v) => {
      if (v.user) userIdsSet.add(v.user.toString());
    });
    allComment.forEach((c) => {
      if (c.user && c.user.toString() !== req.id) userIdsSet.add(c.user.toString());
    });

    // Single batch query for all related users
    const usersList = await User.find({ _id: { $in: Array.from(userIdsSet) } }).select("-password");
    const userMap = new Map();
    usersList.forEach((u) => userMap.set(u._id.toString(), u));

    // Build Likes array
    const likeArr = [];
    for (let index = AllLikes.length - 1; index >= 0; index--) {
      const l = AllLikes[index];
      if (l.user && l.user.toString() !== req.id) {
        likeArr.push({
          notification: l,
          user: userMap.get(l.user.toString()) || null,
          message: "liked your post",
        });
      }
    }

    // Build Follow Requests array
    const FollowReqArr = [];
    for (let index = allFollowReq.length - 1; index >= 0; index--) {
      const f = allFollowReq[index];
      if (f.followerId) {
        FollowReqArr.push({
          notification: f,
          user: userMap.get(f.followerId.toString()) || null,
          message: "sent you follow request",
        });
      }
    }

    // Build View Requests array
    const allViewReqArr = [];
    for (let index = allViewReq.length - 1; index >= 0; index--) {
      const v = allViewReq[index];
      if (v.user) {
        allViewReqArr.push({
          notification: v,
          user: userMap.get(v.user.toString()) || null,
          message: "wants to see your post",
        });
      }
    }

    // Build Comments array
    const allCommentArr = [];
    for (let index = allComment.length - 1; index >= 0; index--) {
      const c = allComment[index];
      if (c.user && c.user.toString() !== req.id) {
        allCommentArr.push({
          notification: c,
          user: userMap.get(c.user.toString()) || null,
          message: "commented on your post",
        });
      }
    }

    const allNotification = [
      likeArr,
      FollowReqArr,
      allViewReqArr,
      allCommentArr,
    ];

    return res.json({ error: false, allNotification });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Router to accept request
router.put("/accept/req", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    if (req.body.reqType === "follow") {
      const newFollow = await Follow.findByIdAndUpdate(
        req.body.reqId,
        { isaccept: true },
        { new: true }
      );
      return res.json({ error: false, reqAccept: newFollow });
    }

    if (req.body.reqType === "view") {
      const accept = await View.findByIdAndUpdate(
        req.body.reqId,
        { isaccept: true },
        { new: true }
      );
      return res.json({ error: false, reqAccept: accept });
    }

    return res.status(400).json({ error: true, message: "Invalid request type" });
  } catch (error) {
    console.error("Accept request error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// Router to deny request
router.delete("/deny/req", fetchuser, async (req, res) => {
  try {
    if (req.id !== req.body.user) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    if (req.body.reqType === "follow") {
      const DenyFollow = await Follow.findByIdAndUpdate(
        req.body.reqId,
        { isRejected: true },
        { new: true }
      );
      return res.json({ error: false, reqDenied: DenyFollow });
    }

    if (req.body.reqType === "view") {
      const denied = await View.findByIdAndUpdate(
        req.body.reqId,
        { isRejected: true },
        { new: true }
      );
      return res.json({ error: false, reqDenied: denied });
    }

    return res.status(400).json({ error: true, message: "Invalid request type" });
  } catch (error) {
    console.error("Deny request error:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

module.exports = router;
