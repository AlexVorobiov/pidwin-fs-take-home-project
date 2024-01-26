import {
    getUserBalance
} from "../services/user-balance.service.js";
import {canUserToss, processToss} from "../services/toss.service.js";

const toss = async (req, res) => {
    const {wager, toss} = req.body;
    const {userId} = req;

    try {
        if (!await canUserToss(userId, wager)) {
            return res.status(400).json({message: "Insufficient costs"});
        }

        const result = await processToss(userId, toss, wager);
        const userTotal = await getUserBalance(userId);
        res.status(200).json({
            result, userTotal
        });
    } catch (error) {
        res.status(500).json({message: "Something went wrong"});
        console.log(error);
    }
};

export default toss;