const express = require("express");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");

const router = express.Router();

/**
 * save profile & update profile
 * get profile
 */

router.post(
  "/",
  auth,
  [
    check("name.firstName", "First name is required")
      .not()
      .isEmpty(),
    check("name.lastName", "Last name is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({
        errors: errors.array(),
        message: "Fail creating profile",
        success: false
      });

    const { name, birthDate } = req.body;
    const profileFields = {};
    profileFields.name = {};
    profileFields.user = req.user.id;
    profileFields.username = req.user.username;
    if (name.firstName) profileFields.name.firstName = name.firstName;
    if (name.middleName) profileFields.name.middleName = name.middleName;
    if (name.lastName) profileFields.name.lastName = name.lastName;
    if (birthDate) profileFields.birthDate = birthDate;
    let profile = await Profile.findOne({ user: req.user.id }).select("name");
    try {
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id
          },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json({
          errors: 0,
          profile,
          message: "Successfully update profile",
          success: true
        });
      }
      profile = new Profile(profileFields);

      await profile.save();
      res.status(201).json({
        errors: errors.array(),
        message: "Successfully create profile",
        profile,
        success: true
      });
    } catch (errors) {
      res.status(500).json({
        errors,
        message: "Server error",
        success: false
      });
    }
  }
);

router.get("/to/:username", async (req, res) => {
  const profile = await Profile.findOne({
    username: req.params.username
  });
  try {
    if (!profile)
      return res.status(404).json({
        errors: 1,
        message: "Profile not found",
        success: false
      });
    res.status(200).json({
      errors: 0,
      message: "Successfully get profile",
      profile,
      success: true
    });
  } catch (errors) {
    res.status(500).json({
      errors,
      message: "Server error",
      success: false
    });
  }
});

module.exports = router;
