import User from "../../src/models/user.js";
import {increaseBalance} from "../../src/services/user-balance.service.js";
import jwt from "jsonwebtoken";

const prepareUser = async function(data) {
    return await User.create(data);
}

const createRegularUser = async function() {
    const data = {
        email: 'existing@example.com',
        password: 'existingpassword',
        name: 'Existing User',
        tokenAmount: 100
    };
    const user = await prepareUser(data)
    await increaseBalance(user._id.toString(), 100, "")
    return user;
}


const mockUserAuth = async function(userId) {
    jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({_id: userId}));
}

module.exports = {
    prepareUser,
    createRegularUser,
    mockUserAuth
}