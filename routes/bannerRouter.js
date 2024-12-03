const express = require('express');
const asyncHandler = require('express-async-handler');
const { banner } = require('../data');
const { BannerModel } = require('../models/bannerModel');

const router = express.Router();

// Seed banner data
router.get('/seed', asyncHandler(
    async (req, res) => {
        const bannerCount = await BannerModel.countDocuments();
        if (bannerCount > 0) {
            return res.send('Seed is already done, banner!');
        }

        await BannerModel.create(banner);
        res.send('Seed is Done!');
    }
));

// Delete banner by productId
router.delete('/deleteBanner/:productId', (req, res) => {
    BannerModel.deleteOne({ _id: req.params.productId }).then(result => { });
    res.status(200).json({ message: 'Banner deleted!' });
});

// Add new banner
router.post("/addBanner", asyncHandler(
    async (req, res) => {
        const { image } = req.body;
        const existingBanner = await BannerModel.findOne({ image });
        if (existingBanner) {
            return res.status(404).send('Product already present');
        }

        const newBanner = {
            id: '',
            image
        };

        const dbBanner = await BannerModel.create(newBanner);
        res.send(dbBanner);
    }
));

// Get all banners
router.get("/", asyncHandler(async (req, res) => {
    const bannerImages = await BannerModel.find();
    res.send(bannerImages);
}));

module.exports = router;