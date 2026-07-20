import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import reviewSchema from "../../validators/customer/review.validator.js";
import { uploadMediaImage } from "../../middlewares/fileUpload.middleware.js";
import reviewController from "../../controllers/customer/review.controller.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails } from "../../middlewares/log.helpers.js";

const reviewRoute = express.Router();

reviewRoute

    .post("/", validate(reviewSchema.createReview), uploadMediaImage,
      logAction({ actionType: "CREATE", entityType: "Reviews", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      reviewController.createReview)
    .put("/:id", validate(reviewSchema.updateReview), uploadMediaImage,
      logAction({ actionType: "UPDATE", entityType: "Reviews", getChanges: updateDetails }),
      reviewController.updateReview)
    .get("/product/:id", reviewController.getReviewByProductId)
    .delete("/:id",
      logAction({ actionType: "DELETE", entityType: "Reviews", getChanges: deleteDetails }),
      reviewController.deleteReview)

export default reviewRoute;
