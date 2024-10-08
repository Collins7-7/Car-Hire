import { trusted } from "mongoose";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/errorHandler.js";

const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (error) {
    next(errorHandler(401, "Bad request"));
  }
};

const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    next(errorHandler(404, "Listing not found"));
    return;
  }

  if (req.user.id !== listing.userRef) {
    console.log(req.params.id);
    console.log(listing.userRef);
    next(errorHandler(401, "You can only delete your own listing"));
    return;
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Successfully deleted!");
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    next(errorHandler(404, "Listing not found"));
    return;
  }

  if (req.user.id !== listing.userRef) {
    next(errorHandler(401, "You can only update your own listing"));
    return;
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

const getSingleListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      next(errorHandler(404, "Listing not found"));
      return;
    }
    return res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["lease", "sale"] };
    }
    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      type,
    })
      .sort({
        [sort]: order,
      })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export {
  createListing,
  deleteListing,
  updateListing,
  getSingleListing,
  getListings,
};
