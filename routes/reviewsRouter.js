const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const { ReviewModel } = require("../models/bannerModel");

const router = Router();

router.post(
  "/post",
  asyncHandler(async (req, res) => {
    const { productName, imageDis, name, number, review } = req.body;

    const newReview = {
      productName,
      imageDis,
      name,
      number,
      review,
    };

    const dbReview = await ReviewModel.create(newReview);
    res.send(dbReview);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const reviews = await ReviewModel.find();
    res.send(reviews);
  })
);

module.exports = router;