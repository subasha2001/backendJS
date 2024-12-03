const { model, Schema } = require("mongoose");

const GSSchema = new Schema(
  {
    gold22: { type: Number },
    gold24: { type: Number },
    gold18: { type: Number },
    silver: { type: Number },
    gst: { type: Number },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

const GoldSilverModel = model("G_S_GST", GSSchema);

module.exports = { GoldSilverModel };