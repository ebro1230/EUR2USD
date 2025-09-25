import mongoose from "mongoose";

const ExchangeRateTrendDataSchema = new mongoose.Schema(
  {
    storedExchangeRates: { type: [Number] },
    from: { type: String },
    to: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ExchangeRateTrendData ||
  mongoose.model("ExchangeRateTrendData", ExchangeRateTrendDataSchema);
