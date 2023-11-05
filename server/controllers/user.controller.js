import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";

const userTest = (req, res) => {
  res.json({
    message: "This is the fist Controller test",
  });
};

const updateUserProfile = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(
      errorHandler(401, "Unauthorized. (You can only update own profile)")
    );
  }

  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
export { userTest, updateUserProfile };
