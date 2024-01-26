import User from "../models/user.js";

const ownProfile = async (req, res) => {
  const {userId} = req;

  try {
    const user = await User.findOne({ _id:userId });

    if (!user) {
      return res.status(404).json({ message: "User Does Not Exist" });
    }
    /*DTO emulation*/
    const profile = {
      name: user.name,
      tokenAmount: user.tokenAmount
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default ownProfile;