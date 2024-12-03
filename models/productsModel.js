const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Jewellery Schema and Model
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 5 },
    imageDis: { type: String, required: true },
    imageHov: { type: String, required: true },
    description: { type: String },
    metalType: { type: [String], required: true },
    category: { type: [String], required: true },
    weight: { type: Number, min: 0 },
    mc: { type: Number, min: 0 },
    size: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    wastage: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const ProductsModel = model("products", ProductSchema);

// Delivery Charge Schema and Model
const DeliveryChargeSchema = new Schema(
  {
    pincode: { type: String, required: true, unique: true },
    charge: { type: Number, required: true },
  }
);

const DeliveryChargeModel = model("deliveryCharges", DeliveryChargeSchema);

module.exports = { ProductsModel, DeliveryChargeModel };