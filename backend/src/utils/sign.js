import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";

const sign = function (id, name, email, password){
    return jwt.sign(
        {
            _id:id,
            name,
            email,
            password,
        },
        config.jwtSecret,
        { expiresIn:  config.jwtExpireTime }
    );
}

export default sign;