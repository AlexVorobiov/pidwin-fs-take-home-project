import {
    getUserBalance,
    decreaseBalance,
    increaseBalance,
    updateUserBalance,
    BalanceChangeReasons
} from "./user-balance.service.js"
import userToss from "../models/user-toss.js";
import {tossCoin} from "../utils/helpers.js";
import UserToss from "../models/user-toss.js";

async function processToss(userId, toss, wager) {
    const result = tossCoin();
    const isWin = toss === result;

    const winRowLength = await getWonRowLength(userId);
    let multiplayer = -1;
    let amount = 0;
    if (!isWin) {
        await decreaseBalance(userId, wager, BalanceChangeReasons.TOSS_LOSE);
    } else {
        multiplayer = 2;
        switch (winRowLength) {
            case 2:
                multiplayer = 3;
                break;
            case 4:
                multiplayer = 10;
                break
            default:

        }
        amount = wager * multiplayer
        await increaseBalance(userId, amount, BalanceChangeReasons.TOSS_WIN)
    }

    if ([3, 4].includes(winRowLength)) {
        await resetWinRow(userId)
    }

    await userToss.create({
        userId,
        result,
        isWin,
        bonus: multiplayer,
        userToss: toss,
        amount
    });

    await updateUserBalance(userId);
    return isWin;
}

async function getWonRowLength(userId) {
    const result = await UserToss.aggregate([
        {
            $match: {
                userId: userId,
                isWin: true,
                isUsedInRowWon: false
            }
        },
        {
            $group: {
                _id: "$userId",
                total: {$count: {}}
            }
        }
    ]);
    return result[0] ? result[0].total : 0
}

async function resetWinRow(userId) {
    await UserToss.updateMany(
        {userId, isUsedInRowWon: false, isWin: true},
        {
            $set: {
                isUsedInRowWon: true
            }
        });
}

async function canUserToss(userId, wager) {
    const balance = await getUserBalance(userId);
    return balance >= wager
}

async function getLatestToss(userId, limit = 10) {
    return UserToss.find({userId})
        .sort({date: -1})
        .limit(limit)
}

module.exports = {
    processToss,
    canUserToss,
    getWonRowLength,
    getLatestToss
}