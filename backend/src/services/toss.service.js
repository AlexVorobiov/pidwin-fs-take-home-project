import {
    getUserBalance,
    decreaseBalance,
    increaseBalance,
    updateUserBalance,
    BalanceChangeReasons
} from "./user-balance.service.js"
import userToss from "../models/user-toss.js";
import {tossCoin} from "../utils/helpers.js";

async function processToss(userId, usersTossing, wager){
    const result = tossCoin();
    const isWon = usersTossing === result;

    if(!isWon){
        await decreaseBalance(userId, wager, BalanceChangeReasons.TOSS_LOSE)
    }else{
        await increaseBalance(userId, wager * 2, BalanceChangeReasons.TOSS_WIN)
    }

    await userToss.create({
        userId,
        result,
        isWon
    });

    await updateUserBalance(userId);
    return isWon;
}


async function canUserToss(userId, wager){
    const balance = await getUserBalance(userId);
    return  balance >= wager
}

module.exports = {
    processToss,
    canUserToss
}