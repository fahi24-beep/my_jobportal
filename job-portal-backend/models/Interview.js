import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  company: {
    type: String,
    required: true,
  },

  position: {
    type: String,
    required: true,
  },

  interviewDate: {
    type: Date,
    required: true,
  },

  interviewLink: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Interview", interviewSchema);
