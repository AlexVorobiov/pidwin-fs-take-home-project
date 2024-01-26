import joi from 'joi';

import {TossResults} from "../utils/const.js";

const tossValidator = joi.object().keys({
    wager: joi.number().required(),
    toss: joi.string().valid(TossResults.HEADS, TossResults.TAILS).required(),
})

module.exports = {
    tossValidator
}