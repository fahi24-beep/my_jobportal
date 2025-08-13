import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";

export const submitReview = asyncHandler(async (req, res) => {
  const { companyId, recruiterId, rating, comment } = req.body;

  if (!companyId || !recruiterId || rating === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const review = new Review({ companyId, recruiterId, rating, comment });
  await review.save();

  res.status(201).json({ success: true, message: "Review submitted successfully", review });
});
