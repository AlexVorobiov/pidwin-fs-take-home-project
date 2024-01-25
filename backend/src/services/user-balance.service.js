import User from "../models/user.js";
import UserBalance from "../models/user-balance.js";

const BalanceChangeReasons = {
    SYSTEM : "SYSTEM",
    SIGNUP_BONUS : "SIGNUP_BONUS",
    TOSS_WIN : "TOSS_WIN",
    TOSS_LOSE: "TOSS_LOSE"
}

async function increaseBalance(userId, amount, reason) {
    await UserBalance.create({userId, amount, reason});
}

async function decreaseBalance(userId, amount, reason) {
    await UserBalance.create({userId, amount: -amount, reason});
}

async function calculateBalance(userId) {
    const result = await UserBalance.aggregate([
        {
            $match: {
                userId : userId
            }
        },
        {
            $group: {
                _id: "$userId",
                total: {$sum: "$amount"}
            }
        }
        ]);

    await User.updateOne({_id: userId}, {tokenAmount: result[0] ? result[0].total : 0});
    return result.total;
}


module.exports = {
    increaseBalance,
    decreaseBalance,
    calculateBalance,
    BalanceChangeReasons
}