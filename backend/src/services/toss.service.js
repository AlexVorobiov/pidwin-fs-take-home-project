import {
    getUserBalance,
    decreaseBalance,
    increaseBalance,
    updateUserBalance,
    BalanceChangeReasons
} from "./user-balance.service.js"
import userToss from "../models/user-toss.js";
import {tossCoin} from "../utils/helpers.js";
import UserBalance from "../models/user-balance.js";
import UserToss from "../models/user-toss.js";

async function processToss(userId, usersTossing, wager) {
    const result = tossCoin();
    const isWon = usersTossing === result;

    const winRowLength = await getWonRowLength(userId);

    if (!isWon) {
        await decreaseBalance(userId, wager, BalanceChangeReasons.TOSS_LOSE);
    } else {
        let multiplayer = 2;

        switch (winRowLength) {
            case 2:
                multiplayer = 3;
                break;
            case 4:
                multiplayer = 10;
                break
            default:
        }
        await increaseBalance(userId, wager * multiplayer, BalanceChangeReasons.TOSS_WIN)
    }

    if ([3, 4].includes(winRowLength)) {
        await resetWinRow(userId)
    }

    await userToss.create({
        userId,
        result,
        isWon
    });

    await updateUserBalance(userId);
    return isWon;
}

async function getWonRowLength(userId) {
    const result = await UserToss.aggregate([
        {
            $match: {
                userId: userId,
                isWon: true,
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
    const r = await UserToss.find({userId});
    await UserToss.updateMany(
        {userId, isUsedInRowWon: false, isWon: true},
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

module.exports = {
    processToss,
    canUserToss,
    getWonRowLength
}