import bcrypt from "bcryptjs";
import User from "../models/user.js";
import sign from "../utils/sign.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User Does Not Exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = sign(existingUser._id, existingUser.name, existingUser.email, existingUser.password);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default login;