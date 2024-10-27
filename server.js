const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();

// Import and connect to your database
const dbConfig = require("./config/dbConfig");

const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies (note the parentheses after express.json)
app.use(express.json());

// Import your routes
const userRoute = require("./routes/userRoute");
const busesRoute = require("./routes/busesRoute");
const bookingsRoute = require("./routes/bookingsRoute");

// Use the routes
app.use("/api/users", userRoute);
app.use("/api/buses", busesRoute);
app.use("/api/bookings", bookingsRoute);
const path = require("path");
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
    });
  }
  


// Start the server
app.listen(port, () => console.log(`Node Server listening on port ${port}!`));
