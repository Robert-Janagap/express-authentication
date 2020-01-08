const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

/**
 * Todo
 * User sign up
 * User sign in
 * User update password
 * User add profile
 * User update profile
 * */

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
        message: "Failed sign up."
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
          } already exist`
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
            token
          });
        }
      );
    } catch (errors) {
      res.status(400).json({
        errors,
        message: "Request failed"
      });
    }
  }
);

module.exports = router;
