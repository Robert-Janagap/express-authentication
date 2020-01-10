const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");

router.post(
  "/sign-up",
  [
    check("username", "Username is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email")
      .isEmail()
      .normalizeEmail(),
    check(
      "password",
      "Please enter a password with 6 or more character"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({
        errors: errors.array(),
        message: "Failed sign up.",
        success: false
      });
    let { username, email, password } = req.body;

    // check if user exist
    let [checkEmail, checkUsername] = await Promise.all([
      User.findOne({ email }).select("email"),
      User.findOne({ username }).select("username")
    ]);

    try {
      if (checkEmail || checkUsername)
        return res.status(409).json({
          errors: 1,
          message: `${
            checkEmail ? checkEmail.email : checkUsername.username
          } already exist`,
          success: false
        });

      let user = new User(req.body);

      // generate hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      const payload = {
        user: {
          id: user.id
        }
      };
      // generate token
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({
            errors: errors.array(),
            message: "Successfully sign up.",
            user,
            token,
            success: true
          });
        }
      );
    } catch (errors) {
      res.status(400).json({
        errors,
        message: "Request failed",
        success: false
      });
    }
  }
);

router.post(
  "/sign-in",
  [
    check("email", "Please include a valid email")
      .isEmail()
      .normalizeEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({
        errors: errors.array(),
        message: "Failed sign in",
        success: false
      });

    const { email, password } = req.body;
    let user = await User.findOne({ email }).lean();

    try {
      if (!user)
        return res.status(401).json({
          errors: 1,
          message: `${email} doesn't exist`,
          success: false
        });

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch)
        return res.status(401).json({
          errors: 1,
          message: `Invalid password`,
          success: false
        });

      const payload = {
        user: {
          id: user._id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            errors: errors.array(),
            message: "Successfully sign in.",
            user,
            token,
            success: true
          });
        }
      );
    } catch (errors) {
      res.status(400).json({
        errors,
        message: "Failed sign in",
        success: false
      });
    }
  }
);

router.post("/change-password", auth, async (req, res) => {
  const { password } = req.body;
  const { id } = req.user;
  let user = await User.findById(id).select("password");

  try {
    if (!user)
      return res.status(401).json({
        errors: 1,
        message: `User ID doesn't exist`,
        success: false
      });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(200).json({
      errors: [],
      user,
      message: "Successfully changed password",
      success: true
    });
  } catch (errors) {
    res.status(400).json({
      errors,
      message: "Failed change password",
      success: false
    });
  }
});

module.exports = router;
