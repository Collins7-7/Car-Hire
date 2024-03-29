import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import { response } from "express";

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

const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account!"));
  }
  await User.findByIdAndDelete(req.params.id);

  res.clearCookie("access_token");
  res.status(200).json({ message: "Account deleted successfully" });
};

const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    next(errorHandler(401, "You can only view your own listings"));
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// const getOneUserListing = async (req, res, next) => {
//   //// Using a user, we can find there listings, search their listings and compare the params id with a single
//   // listing in their listings and when we find it, we return that particular listing to the user.
//   try {
//     const listing = await Listing.findById(req.params.id);
//     if (listing.userRef === req.user.id) {
//       res.status(200).json(listing);
//     } else {
//       next(errorHandler(401, "You can only view your own listing"));
//     }
//   } catch (error) {
//     next(errorHandler(404, "Couldn't find listing"));
//   }
// };

export {
  userTest,
  updateUserProfile,
  deleteUser,
  getUserListings,
  getUser,

  // getOneUserListing,
};
