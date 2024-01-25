import mongoose from "mongoose";

const userBalanceSchema = mongoose.Schema({
    userId: { type: String },
    amount: { type: Number },
    reason: { type: String },
    date: { type: Date, default: Date.now()}
});

export default mongoose.model("UserBalance", userBalanceSchema);