const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middlewire/fetchUser");
const Note = require("../models/notes");
const User = require("../models/auth");
const Post = require("../models/social/postUpload");
const Folder = require("../models/folder");
const About = require("../models/social/postAbout");
const Like = require("../models/social/postLike");
const View = require("../models/social/viewReq");
const Follow = require("../models/social/followReq");
const Comment = require("../models/social/commentSave");
require('dotenv').config();

const JWTserect = process.env.JWT_MESSAGE;

// route-1 : create end point for new user with name , email and password
router.post(
  "/create",
  [
    body("firstName")
      .trim()
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters"),
    body("about")
      .trim()
      .isLength({ min: 5 })
      .withMessage("About must be at least 5 characters"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address"),
  ],

  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: result.array().map((item) => item.msg).join(", "),
        errors: result.array().map((item) => ({ field: item.path, message: item.msg })),
      });
    }

    try {
      const email = req.body.email.trim().toLowerCase();

      // Check if a user with the same email already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(409).json({ error: true, message: "An account with this email already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const serectPassword = await bcrypt.hash(req.body.password, salt);

      // Create new user
      user = new User({
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        password: serectPassword,
        email,
        profileimg: req.body.url && req.body.url !== "undefined" ? req.body.url : "",
        creatDate: Date.now(),
        lastLogin: Date.now(),
        about: req.body.about.trim(),
      });

      await user.save();

      // Create JSON web token for security
      const jwtToken = jwt.sign({ id: user.id }, JWTserect, { expiresIn: "7d" });
      return res.status(201).json({ jwtToken, userid: user._id });
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.code === 11000) {
        return res.status(409).json({ error: true, message: "An account with this email already exists" });
      }
      return res.status(500).json({ error: true, message: "Could not create your account. Please try again." });
    }
  }
);

// route-2 : create end point to login user with email and password
router.post(
  "/login",
  [body("password").isLength({ min: 5 }), body("email").isEmail()],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ error: result.array(), message: "Too short inputs" });
    }
    try {
      const email = (req.body.email || "").trim().toLowerCase();
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ error: true, message: "login with valid credentials" });
      }
      const check = await bcrypt.compare(req.body.password, user.password);
      if (!check) {
        return res.json({ error: true, message: "incorrect Password" });
      }
      await User.findOneAndUpdate({ _id: user._id }, { lastLogin: Date.now() });
      const data = {
        id: user.id,
      };
      const jwtToken = jwt.sign(data, JWTserect, { expiresIn: "7d" });
      return res.json({ jwtToken, userid: user._id });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).send("some internal error occured");
    }
  }
);

// route-3: get user's information
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    if (req.body.user && req.body.user !== req.id) {
      return res.status(401).json({ message: "authentication denied", error: true });
    }
    const targetUserId = req.body.userId || req.id;
    const user = await User.findById(targetUserId).select("-password");
    if (!user) {
      return res.json({ error: true, message: "User not found" });
    }
    const posts = await Post.find({ user: targetUserId, type: "file" });
    const about = await About.find({ user: targetUserId });
    const likes = await Like.find({ userId: targetUserId });
    const followers = await Follow.find({ followingId: targetUserId, isaccept: true });
    const pendding = await Follow.find({ followingId: targetUserId, isaccept: false, isRejected: false });
    const followings = await Follow.find({ followerId: targetUserId, isaccept: true });
    const view = await View.find({ userId: targetUserId });
    const comment = await Comment.find({ userId: targetUserId });
    comment.reverse();

    return res.json({
      user,
      error: false,
      posts,
      about,
      likes,
      followers,
      followings,
      view,
      comment,
      pendding,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).send("some error occured");
  }
});

// route-4: to edit user information
router.put(
  "/edit",
  fetchuser,
  [
    body("firstName").isLength({ min: 3 }),
    body("lastName").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
    body("email").isEmail(),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ error: true, message: "Too small inputs" });
    }
    if (req.body.user && req.body.user !== req.id) {
      return res.status(401).json({ message: "authentication denied", error: true });
    }

    try {
      let user = await User.findById(req.id);
      if (!user) {
        return res.json({ error: true, message: "User not found" });
      }
      const check = await bcrypt.compare(req.body.password, user.password);
      if (!check) {
        return res.json({ error: true, message: "incorrect Password" });
      }
      user = await User.findByIdAndUpdate(
        req.id,
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email.trim().toLowerCase(),
          profileimg: req.body.url,
          lastUpdate: Date.now(),
        },
        { new: true }
      );
      return res.json({ message: "Account Update Successfully", user, lastUpdate: Date.now() });
    } catch (error) {
      console.error("Edit user error:", error);
      return res.status(500).send("some error occured");
    }
  }
);

// route-5 : check if email exists
router.put("/email/exist", fetchuser, async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const useremail = await User.findOne({ _id: req.id, email });
    const anotheremail = await User.findOne({ email });
    if (useremail !== null) {
      return res.json({ exist: false });
    } else {
      if (anotheremail === null) {
        return res.json({ exist: false, message: "new email not present" });
      } else {
        return res.json({
          exist: true,
          message: "Email with same address already exists... please try with another Email",
        });
      }
    }
  } catch (error) {
    return res.status(500).send("some error occured");
  }
});

// route-6 : check if password is correct for logged-in user
router.put("/password/exist", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res.json({ error: true, message: "User not found" });
    }
    const check = await bcrypt.compare(req.body.password, user.password);
    if (!check) {
      return res.json({ error: true, message: "incorrect Password" });
    }
    return res.json({ error: false });
  } catch (error) {
    return res.status(500).send("some error occured");
  }
});

module.exports = router;
