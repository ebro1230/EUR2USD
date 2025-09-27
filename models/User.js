import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String },
    interval: { type: Number },
    lastCheck: { type: Date },
    days: { type: Number },
    hours: { type: Number },
    minutes: { type: Number },
    thresholdValue: { type: Number },
    trendNotifications: { type: Boolean },
    from: { type: String },
    to: { type: String },
    conversionAmount: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
