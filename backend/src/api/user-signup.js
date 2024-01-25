import bcrypt from "bcryptjs";
import User from "../models/user.js";
import sign from "../utils/sign.js";

const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exist" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password Does Not Match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });
    const token = sign(result._id, result.name, result.email, result.hashedPassword);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export default signup;