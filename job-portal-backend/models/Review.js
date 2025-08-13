import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
