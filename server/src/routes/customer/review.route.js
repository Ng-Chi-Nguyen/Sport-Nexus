import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import reviewSchema from "../../validators/customer/review.validator.js";
import { uploadMediaImage } from "../../middlewares/fileUpload.middleware.js";
import reviewController from "../../controllers/customer/review.controller.js";

const reviewRoute = express.Router();

reviewRoute

    .post("/", validate(reviewSchema.createReview), uploadMediaImage, reviewController.createReview)
    .put("/:id", validate(reviewSchema.updateReview), uploadMediaImage, reviewController.updateReview)
    .get("/product/:id", reviewController.getReviewByProductId)
    .delete("/:id", reviewController.deleteReview)

export default reviewRoute;