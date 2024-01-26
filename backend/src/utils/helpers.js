const {TossResults} = require("./const.js");
const tossCoin = function () {
    return Math.random() < 0.5 ? TossResults.HEADS : TossResults.TAILS;
}

module.exports = {
    tossCoin
}