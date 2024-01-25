import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  id: {
    type: String
  },
  tokenAmount: { // it can be moved to separate collection if we need to use more than one token
    type: Number,
    default:0
  }
});

export default mongoose.model("User", userSchema);