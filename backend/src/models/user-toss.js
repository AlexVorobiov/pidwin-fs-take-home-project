import mongoose from "mongoose";
import {TossResults} from "../utils/const.js";

const userTossSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    result: {
        type: String,
        enum: [TossResults.HEADS, TossResults.TAILS],
        required: true
    },
    isWon: {
        type: Boolean,
        required: true
    },
    isUsedInRowWon: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date
    }
});

export default mongoose.model("UserToss", userTossSchema);