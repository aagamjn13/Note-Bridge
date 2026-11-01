const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middlewire/fetchUser");
// const fileUpload = require("express-fileupload")
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
  //express validation check
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
    //check if the inputs are good or not
    if (!result.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: result.array().map((item) => item.msg).join(", "),
        errors: result.array().map((item) => ({ field: item.path, message: item.msg })),
      });
    }

    try {
      const email = req.body.email.trim().toLowerCase();

      //check if a user with the same email already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(409).json({ error: true, message: "An account with this email already exists" });
      }

      //hash the password
      const salt = await bcrypt.genSalt(10);
      const serectPassword = await bcrypt.hash(req.body.password, salt);

      //create new user
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

      //create json web token for security
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

//route-2 : creat end point to login user with email and password
router.post(
  "/login",
  //express valivation check
  [body("password").isLength({ min: 5 }), body("email").isEmail()],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ error : result.array() , message : "Too short inputs" });
    }
    try {
      const user = await User.findOne({ email: req.body.email });//get user if exist
      if (!user) {//if user does not exist
        return res.json({ error:true , message : "login with valid credentials" });
      }
      const check = await bcrypt.compare(req.body.password, user.password);//check password correct or not
      if (!check) {
        return res.json({ error:true , message: "incorrect Password" });
      }
      await User.findOneAndUpdate({ email: req.body.email } , {lastLogin : Date.now()})
      let data = {
        id: user.id,
      };
      const jwtToken = jwt.sign(data, JWTserect);
      return res.json({ jwtToken , userid : user._id });
    } catch (error) {
       return res.status(500).send("some internal error occured");
    }
  }
);

//route-3:get users information 
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    //check is the same user or not
    if (req.body.user !== req.id) {
      return res.json({message : "authentication denied" , error : true});
    }
    const user = await User.findById(req.body.userId).select("-password")
    const posts = await Post.find({user : req.body.userId , type : "file"})
    const about = await About.find({user : req.body.userId})
    const likes = await Like.find({userId : req.body.userId})
    const followers = await Follow.find({followingId : req.body.userId , isaccept : true})
    const pendding = await Follow.find({followingId : req.body.userId , isaccept : false , isRejected : false})
    const followings = await Follow.find({followerId  :req.body.userId , isaccept : true})
    const view = await View.find({userId : req.body.userId})
    const comment = await Comment.find({userId : req.body.userId})
    comment.reverse()

    return res.json({user , error : false , posts ,about, likes ,followers ,followings , view ,comment , pendding})
  } catch (error) {
     return res.status(500).send("some error occured");
  }
});


//route-4:to edit user information 
router.put("/edit",fetchuser,
//express valivation check
[
  body("firstName").isLength({ min: 3 }),
  body("lastName").isLength({ min: 3 }),
  body("password").isLength({ min: 5 }),
  body("email").isEmail(),
],async (req, res) => {
  const result = validationResult(req);
  //check is inputs good or not
  if (!result.isEmpty()) {
     return res.json({error:true ,  message: "Too small inputs" });
  }
  //check is the same user or not
  if (req.body.user !== req.id) {
    return res.json({message : "authentication denied" , error : true});
  }

  try {
    let user = await User.findById(req.id);
     if (!user) {//if user does not exist
      return res.json({ error:true , message : "User not found" });
    }
    const check = await bcrypt.compare(req.body.password, user.password);//check password correct or not
    if (!check) {
      return res.json({ error:true , message: "incorrect Password" });
    }
     user = await User.findByIdAndUpdate(req.id , {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profileimg : req.body.url,
      lastUpdate : Date.now(),
    })
     return res.json({message : "Account Update Successfully" , user : user , lastUpdate : Date.now()})

  }catch (error) {
     return res.status(500).send("some error occured");
  }
})

//route-5 : just send res if a particular email exist or not
router.put("/email/exist",fetchuser,async (req, res) => {
  const useremail = await User.findOne({_id : req.id , email : req.body.email})
   const anotheremail = await User.findOne({email : req.body.email})
   if(useremail !== null ){
    return res.json({exist : false})
  }
  else{
    if( anotheremail === null){
       return res.json({exist : false , message : "new email not present"})
    }else{
       return res.json({exist : true , message : "Email with same address already exists... please try with another Email"})
    }
  }    

  
})


//route-6 : just send res if a password is correct or not for a  particular email 
router.put("/password/exist",fetchuser,async (req, res) => {
  const user = await User.findById(req.id)
  const check = await bcrypt.compare(req.body.password, user.password);
  if (!check) {
    return res.json({ error:true , message: "incorrect Password" });
  }
  return res.json({error : false})
})

module.exports = router;
