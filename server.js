const dotenv = require('dotenv');
const cookieParser = require("cookie-parser")
const express = require("express");
const mongoose = require("mongoose");
// const multer = require('multer');

const tourRoute = require("./route/tourRoute");
const adminRoute = require("./route/adminRoute")
const errorController = require('./controller/errorController');
const errorHandling = require('./utils/errorHandling');
const app = express();
// security packages
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const cors = require('cors')

const corsOptions = {
    origin: process.env.URL
}
// Load environment variables from .env file
dotenv.config();

// Define rate limit configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// filtering out duplicate query
function preventHPP(req, res, next) {
    const queryParams = req.query;
    const seenParams = new Set();

    // Filter out duplicate query parameters
    Object.keys(queryParams).forEach(key => {
        if (seenParams.has(key)) {
            delete queryParams[key]; // Remove duplicates
        } else {
            seenParams.add(key);
        }
    });

    // Pass the cleaned query parameters forward
    req.query = queryParams;
    next();
}
// Middleware to parse incoming JSON requests
app.use(express.json());
//security 
app.use(limiter)
app.use(helmet())
app.use(preventHPP)
app.use(cors(corsOptions))
//////////////////////////
app.use(cookieParser())

// Function to connect to the database
async function databaseConnect() {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log("Database connected successfully");
    } catch (error) {
        console.error(`Error connecting to the database: ${error.message}`);
        // Handle error 
        throw new errorHandling(error, 500);
    }
}

// Call the database connection function
databaseConnect();

// Mount the tour route
app.use("/", tourRoute);
app.use("/admin/", adminRoute);

// Handle any unhandled routes with a 404 error
app.all("*", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: "Invalid website path"
    });
});

// Global error handling middleware
app.use(errorController);

// Import the port from the .env file
const PORT = process.env.PORT || 3000;  // Use default port 3000 if not specified in .env

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`App is running on ${process.env.NODE_ENV} mode `);
});
