import mongoose from "mongoose";
import {TossResults} from "../utils/const.js";

const userTossSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userToss: {
        type: String,
        enum: [TossResults.HEADS, TossResults.TAILS],
        required: true
    },
    result: {
        type: String,
        enum: [TossResults.HEADS, TossResults.TAILS],
        required: true
    },
    isWin: {
        type: Boolean,
        required: true
    },
    isUsedInRowWon: {
        type: Boolean,
        default: false
    },
    bonus: {
        type: Number,
        default: -1
    },
    amount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

export default mongoose.model("UserToss", userTossSchema);