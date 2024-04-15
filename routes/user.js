const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const verifyToken = require("../middleware/auth");
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

router.get("/user-details", verifyToken, async (req, res) => {
	const userId = req.userId;

	try {
		const user = await User.findById(userId).select("-password");
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		res.json({ email: user.email, firstName: user.firstName, lastName: user.lastName });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Something went wrong" });
	}
});

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    console.log("Hello")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
      console.log("I am running!!!!")
      user = new User(req.body);
      await user.save();

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      return res.status(200).json({ success: true, message: "User registered successfully" });
    } catch (error) {
      console.error("Registration failed:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
);
router.put("/update-details", verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Update user details if provided in the request body
    if (req.body.firstName) {
      user.firstName = req.body.firstName;
    }
    if (req.body.lastName) {
      user.lastName = req.body.lastName;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }

    await user.save();

    res.json({ success: true, message: "User details updated successfully" });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
