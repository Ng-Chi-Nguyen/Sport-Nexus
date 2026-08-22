import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { verifyToken, checkPermission } from "../../middlewares/verifyToken.middlware.js";
import reviewSchema from "../../validators/management/review.validator.js";
import reviewController from "../../controllers/management/review.controller.js";
import reviewService from "../../services/management/review.service.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { updateDetails, fetchEntity } from "../../middlewares/log.helpers.js";

const fetchOldReview = fetchEntity(
  (id) => reviewService.getReviewById(id)
);

const clearReplyChanges = () => [{ field: "reply_comment", to: null }];

const reviewRoute = express.Router();

reviewRoute
  .get("/", verifyToken, checkPermission("xem-danh-gia"),
    reviewController.getAllReviews)

  .put("/:id/reply",
    validate(reviewSchema.replyReview),
    logAction({ actionType: "UPDATE", entityType: "Reviews", getOldData: fetchOldReview, getChanges: updateDetails }),
    reviewController.replyToReview)

  .delete("/:id/reply", verifyToken, checkPermission("sua-danh-gia"),
    logAction({ actionType: "UPDATE", entityType: "Reviews", getOldData: fetchOldReview, getChanges: clearReplyChanges }),
    reviewController.deleteReply)

  .put("/:id/visibility", verifyToken, checkPermission("sua-danh-gia"),
    validate(reviewSchema.visibilityReview),
    logAction({ actionType: "UPDATE", entityType: "Reviews", getOldData: fetchOldReview, getChanges: updateDetails }),
    reviewController.setVisibility)

export default reviewRoute;
