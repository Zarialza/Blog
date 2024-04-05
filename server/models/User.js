const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Destructuring to get Schema

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
); // Optional: Disable versionKey if not needed

// Before saving, consider hashing the password with bcrypt in a pre-save hook

module.exports = mongoose.model("User", userSchema);
