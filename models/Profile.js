const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    username: {
      type: String,
      required: true
    },
    name: {
      firstName: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
      },
      lastName: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
      },
      middleName: {
        type: String,
        lowercase: true,
        trim: true
      }
    },
    birthDate: Date
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    toJSON: {
      virtuals: true
    }
  }
);

ProfileSchema.virtual("fullName").get(function() {
  return `${this.name.firstName} ${this.name.middleName} ${this.name.lastName}`;
});

module.exports = Profile = mongoose.model("Profile", ProfileSchema);
