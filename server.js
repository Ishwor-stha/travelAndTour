const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const express = require("express");
const path=require("path");
const {databaseConnect}=require("./utils/databaseConnect");

const tourRoute = require("./route/tourRoute");
const adminRoute = require("./route/adminRoute");
const errorController = require('./controller/errorController');
const app = express();
// security packages
const {limiter} = require("./utils/rateLimit");
const helmet = require('helmet');
const cors = require('cors');
const {preventHPP}=require("./utils/preventHpp");

const corsOptions = {
    origin: process.env.URL
}
// loading environment variables from .env file
dotenv.config();

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({limit: '10kb'}))//limiting the json body size to 10 kb
//security 
app.use(limiter);
app.use(helmet());
app.use(preventHPP);
app.use(cors(corsOptions));
//////////////////////////
app.use(cookieParser());

// Function to connect to the database
databaseConnect();

// Mount the tour route
app.use("/api/", tourRoute);
app.use("/api/admin/", adminRoute);

// Handle any unhandled routes with a 404 error
app.all("*", (req, res) => {
    res.status(400).json({
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
