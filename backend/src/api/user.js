import express from "express";
import login from "./user-login.js";
import signup from "./user-signup.js";
import changePassword from "./user-change-password.js";
import auth from "../utils/auth.js";
import toss from "./toss.js";
import validate from '../utils/validate.js'
import {tossValidator} from '../validators/toss.validator.js'
import ownProfile from "./user-own-profile.js";
import tossList from "./toss-list.js";


const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/changePassword", auth, changePassword);
router.get("/profile", auth, ownProfile);
router.post("/toss", auth, validate(tossValidator), toss);
router.get("/toss", auth, tossList);

export default router;
