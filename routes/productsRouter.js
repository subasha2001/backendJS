const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const { ProductsModel } = require("../models/productsModel");
const { jewellers } = require("../data");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = Router();

// Seed Route
router.get(
  "/seed",
  asyncHandler(async (req, res) => {
    const productsCount = await ProductsModel.countDocuments();
    if (productsCount > 0) {
      return res.send("Seed is already done");
    }
    await ProductsModel.create(jewellers);
    res.send("Seed is Done!");
  })
);

// Get all products
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await ProductsModel.find();
    res.send(products);
  })
);

// Search products
router.get(
  "/search/:searchTerm",
  asyncHandler(async (req, res) => {
    const searchRegExp = new RegExp(req.params.searchTerm, "i");
    const products = await ProductsModel.find({
      $or: [
        { name: { $regex: searchRegExp } },
        { description: { $regex: searchRegExp } },
        { category: { $regex: searchRegExp } },
        { metalType: { $regex: searchRegExp } },
      ],
    });
    res.send(products);
  })
);

// Get all metal types
router.get(
  "/metalType",
  asyncHandler(async (req, res) => {
    const metalType = await ProductsModel.aggregate([
      { $unwind: "$metalType" },
      { $group: { _id: "$metalType" } },
      { $project: { _id: 0, name: "$_id" } },
    ]);
    res.send(metalType);
  })
);

// Get products by metal type
router.get(
  "/metalType/:metalTypeName",
  asyncHandler(async (req, res) => {
    const product = await ProductsModel.find({
      metalType: req.params.metalTypeName,
    });
    res.send(product);
  })
);

// Get all categories with product count
router.get(
  "/category",
  asyncHandler(async (req, res) => {
    try {
      const categories = await ProductsModel.distinct("category");
      const categoryCounts = [];

      for (const category of categories) {
        const count = await ProductsModel.countDocuments({ category });
        categoryCounts.push({ name: category, count });
      }

      const allCount = await ProductsModel.countDocuments();
      categoryCounts.unshift({ name: "All", count: allCount });

      res.send(categoryCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

// Get products by category
router.get(
  "/category/:categoryName",
  asyncHandler(async (req, res) => {
    const product = await ProductsModel.find({
      category: req.params.categoryName,
    });
    res.send(product);
  })
);

// Get product by ID
router.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const product = await ProductsModel.findById(req.params.productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.send(product);
  })
);

// Delete product by ID
router.delete("/deleteProduct/:productId", async (req, res) => {
  try {
    await ProductsModel.deleteOne({ _id: req.params.productId });
    res.status(200).json({ message: "Product deleted!" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting product" });
  }
});

// Update product by ID
router.put("/getProductValue/:productId", async (req, res) => {
  const { productId } = req.params;
  const updatedData = req.body;

  if (typeof updatedData.category === "string") {
    updatedData.category = updatedData.category
      .split(",")
      .map((category) => category.trim());
  }

  try {
    const updatedItem = await ProductsModel.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send("Item not found");
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);  // Create uploads directory if not exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Handle image upload
router.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    imageUrl: `${req.file.filename}`,
  });
});

// Add new product
router.post(
  "/addProduct",
  asyncHandler(async (req, res) => {
    const {
      name,
      imageDis,
      imageHov,
      description,
      category,
      metalType,
      weight,
      mc,
      size,
      stock,
      wastage,
      price,
    } = req.body;

    const product = await ProductsModel.findOne({ name });
    if (product) {
      return res.status(400).send("Product already exists");
    }

    const newProduct = new ProductsModel({
      name,
      imageDis,
      imageHov,
      description,
      metalType: metalType.toLowerCase(),
      category,
      weight,
      mc,
      size,
      stock,
      wastage: wastage / 100,
      price,
    });

    await newProduct.save();
    res.status(200).send(newProduct);
  })
);

module.exports = router;