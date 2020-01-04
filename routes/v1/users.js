const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const debug = require("debug")("server:debug");

router.post("/sign-up", async (req, res) => {
  user = new User(req.body);
  await user.save();
  res.status(201).json({
    message: "success"
  });
});

module.exports = router;
