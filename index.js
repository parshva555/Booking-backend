const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const userRoutes = require("./routes/user")
const authRoutes = require("./routes/auth");
const hotelRoutes = require("./routes/hotels");
const bookingRoutes = require("./routes/booking");

dotenv.config();

mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/booking", bookingRoutes);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

app.listen(7000, () => {
  console.log("Server running on localhost:7000");
});
