import jwt from "jsonwebtoken";
import {config} from "../../config/index.js"

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        if(!token){
            return res.status(401).json({ message: "Wrong auth!" });
        }

        const isCustomAuth = token.length < 500;

        let decodedData;

        if (token && isCustomAuth) {
            decodedData = jwt.verify(token, config.jwtSecret);
            req.userId = decodedData?._id;
        } else {
            decodedData = jwt.decode(token);
            req.userId = decodedData?.sub;
        }

        next();
    } catch (error) {
        next(error)
        console.error(error)
    }
};

export default auth;
