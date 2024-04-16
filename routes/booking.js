const express = require("express");
const Hotel = require("../models/hotel");
const verifyToken = require("../middleware/auth");
const router = express.Router();

router.get("/get-bookings", verifyToken, async (req, res) => {
  try {
    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );

      const hotelWithUserBookings = {
        ...hotel.toObject({ getters: true }),
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

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
// backend/routes/booking.js

router.delete("/:bookingId", verifyToken, async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { "bookings._id": req.params.bookingId },
      {
        $pull: { bookings: { _id: req.params.bookingId, userId: req.userId } },
      },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});


module.exports = router;
