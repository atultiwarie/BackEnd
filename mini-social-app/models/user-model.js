const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: String,
    age: Number,
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    profilePic: {
      type: String,
      default:
        "https://strichardchurch.org/wp-content/uploads/2023/02/istockphoto-1167753373-612x612-1.jpg",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
