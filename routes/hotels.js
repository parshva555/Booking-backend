const express = require("express");
const { param, validationResult } = require("express-validator");
const Hotel = require("../models/hotel");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);
router.get("/city", async (req, res) => {
    const { city } = req.query;
    console.log("Received city:", city); // Log the received city parameter
    try {
      // Capitalize the first letter of the city
      const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      console.log("Capitalized city:", capitalizedCity); // Log the capitalized city for verification
      const hotels = await Hotel.find({ city: capitalizedCity }).sort("-lastUpdated");
      res.json(hotels);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Error fetching hotels" });
    }
});


module.exports = router;
