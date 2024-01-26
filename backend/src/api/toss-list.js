import {getLatestToss} from "../services/toss.service.js";

const tossList = async (req, res) => {
    const {userId} = req;

    try {
        const list = await getLatestToss(userId);
        /*DTO emulation*/
        const result = list.map((e) => ({
            userToss: e.userToss,
            result: e.result,
            isWin: e.isWin,
            bonus: e.bonus,
            amount: e.amount,
            date: e.date
        }));
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: "Something went wrong"});
        console.log(error);
    }
};

export default tossList;