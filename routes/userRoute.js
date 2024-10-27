const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/usersModel"); // Ensure consistency in naming
const authMiddleware = require("../middlewares/authMiddleware");

// Register new user

router.post("/register", async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({
        message: "User already exists",
        success: false,
        data: null,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;

    // Create new user
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).send({
      message: "User created successfully",
      success: true,
      data: null,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
      data: null,
    });
  }
});

// Login user

router.post("/login", async (req, res) => {
  try {
    // Check if user exists
    const userExists = await User.findOne({ email: req.body.email });
    if (!userExists) {
      return res.status(404).send({
        message: "User does not exist",
        success: false,
        data: null,
      });
    }
    if (userExists.isBlocked) {
      return res.send({
        message: "Your account is blocked , please  contact with admin",
        success: false,
        data: null,
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      userExists.password
    );

    if (!passwordMatch) {
      return res.status(401).send({
        message: "Incorrect password",
        success: false,
        data: null,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userExists._id },
      process.env.jwt_secret, // Make sure this env variable is defined
      {
        expiresIn: "1d", // Token expires in 1 day
      }
    );

    // Send token in response
    return res.status(200).send({
      message: "Login successful",
      success: true,
      data: token,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
      data: null,
    });
  }
});

// get user by id

router.post("/get-user-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    res.send({
      message: "User fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

// get all users

router.post("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

// update user

router.post("/update-user-permissions", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body._id, req.body);
    res.send({
      message: "User permissions updated successfully",
      success: true,
      data: null,
    });
  } catch {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
});

module.exports = router;
