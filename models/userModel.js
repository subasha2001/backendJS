const { model, Schema } = require("mongoose");

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    number: { type: Number, required: true },
    pincode: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const UserModel = model("user", UserSchema);

module.exports = { UserModel };