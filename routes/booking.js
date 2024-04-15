const express = require("express");
const { param, validationResult } = require("express-validator");
const Hotel = require("../models/hotel");
const verifyToken = require("../middleware/auth");

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req, res) => {
    try {
      const newBooking = {
        ...req.body,
        userId: req.userId,
      };

      const hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.hotelId },
        {
          $push: { bookings: newBooking },
        }
      );

      if (!hotel) {
        return res.status(400).json({ message: "hotel not found" });
      }

      await hotel.save();
      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  }
);
