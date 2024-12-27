const Tour = require("../modles/tourModel");
const { deleteImage } = require("../utils/deleteImage");
const errorHandler = require("../utils/errorHandling");
const fs = require("fs");
const path = require("path");
const { validateEmail } = require("../utils/emailValidation");
const { bookMessage } = require("../utils/bookingMessage");
const { isValidNepaliPhoneNumber } = require("../utils/validatePhoneNumber");
const sendMessage = require("../utils/sendMessage");
const {isValidNumber}=require("../utils/isValidNumber");


//@method :GET 
//@Endpoint: localhost:6000/get-tours
//@desc:Getting the array of  of tours in object
module.exports.getTours = async (req, res, next) => {
    try {
        // variable for sorting
        let sort;

        // let query={}
        let condition = [];
        let fields = ["placeName", "active_month", "destination", "category", "tour_type", "duration", "name",]

        // destructuring query parameters
        let { page = 1 } = req.query;

        // Handling the sorting logic
        if (req.query.adult_price || req.query.youth_price || req.query.popularity) {
            const { adult_price, youth_price, popularity } = req.query
            if (adult_price) sort = adult_price === "asc" ? 1 : -1;
            if (youth_price) sort = youth_price === "asc" ? 1 : -1;
            if (popularity) sort = popularity === "asc" ? 1 : -1;

        }
        for (let keys in req.query) {
            if (fields.includes(keys)) {
                if (keys === "active_month") {

                    // new RegExp("pattern",flags) object is used to make a data case insensitive "i" stands for insensitive  
                    condition.push({ active_month: { $in: [req.query[keys]] } });;;//i.e{ destination: /mustang/i }
                }
                else {
                    condition.push({ [keys]: new RegExp(req.query[keys], "i") });
                }
            }
        }


        // Building the condition for $or condition
        // new RegExp("pattern",flags) object is used to make a data case insensitive "i" stands for insensitive  
        // if (destination) condition.push({ destination: new RegExp(destination, 'i') });//i.e{ destination: /mustang/i }
        // if (category) condition.push({ category: new RegExp(category, 'i') });
        // if (type) condition.push({ type: new RegExp(type, 'i') });
        // if (duration) condition.push({ duration: duration });
        // if (name) condition.push({ name: new RegExp(name, 'i') });
        // console.log(condition)

        // Fetching the data from the database using $or condition for flexible matching
        let tourQuery = Tour.find();

        if (condition.length > 0) {
            // Use $or if any of the conditions are provided
            tourQuery = tourQuery.where({ $or: condition });
        }

        // If sorting by price 
        if (req.query.adult_price || req.query.youth_price || req.query.popularity) {
            if (req.query.popularity) tourQuery = tourQuery.sort({ popularity: sort });;
            if (req.query.adult_price) tourQuery = tourQuery.sort({ adult_price: sort });
            if (req.query.youth_price) tourQuery = tourQuery.sort({ youth_price: sort });

        }

        //pagination logic
        //string to integer
        page = parseInt(page);
        // page is <0 then set to 1 otherwise set page to roundup value of page
        page = (page > 0) ? Math.ceil(page) : 1;
        const limit = 10;
        const skip = (page - 1) * limit; // Skip results based on current page

        const tour = await tourQuery.skip(skip).limit(limit);
        // if there is is tour 
        if (!tour || Object.keys(tour).length <= 0) return next(new errorHandler("No tour found.", 404));

        res.status(200).json({
            status: "Success",
            tourList: tour
        });

    } catch (error) {
        // res.status(404).json({
        //     status: "Failed",
        //     message: error.message
        // });
        // passing erorr to the error handling middleware
        next(new errorHandler(error.message, error.statusCode || 500));



    }
};

//@method :GET 
//@Endpoint: localhost:6000/get-one-tour/:slug
//@desc:Getting the detail of  tour 
module.exports.getOneTour = async (req, res, next) => {
    try {
        const { slug } = req.params;
        if (!slug) return next(new errorHandler("No slug given of tour.Please try again.", 400));
        const tour = await Tour.findOne({ slug: slug }, "");
        if (!tour || Object.keys(tour).length < 0) return next(new errorHandler("No tour found.Please try again", 404));
        res.status(200).json({
            status: "Success",
            tour
        })

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

//@EndPoint:localhost:6000/tour-admin/post-tour
//@method:POST
//@desc:Adding the tours
module.exports.postTour = async (req, res, next) => {
    try {
        let data = {};
        const keys = [
            "name", "adult_price", "youth_price", "description", "destination",
            "category", "tour_type", "duration", "discount", "placeName",
            "active_month", "popularity", "minimumGuest"
        ];

        // Insert data by filtering
        for (let key in req.body) {
            if (keys.includes(key)) {
                if (typeof req.body[key] === "number") {
                    data[key] = req.body[key];
                } else if (req.body[key] != null) {
                    data[key] = req.body[key].toString();
                }
            }
        }
        // console.log(req.files)
        // console.log(req.body)

        // Handle multiple file uploads (if present)
        if (req.files) {
            // Store all image file paths in an array
            data.image = req.files.map(file => file.path);
        }

        // Create a new tour in the database
        const newTour = await Tour.create(data);
        if (!newTour || Object.keys(newTour).length === 0) {
            // Delete uploaded files on failure
            if (req.files) {
                const uploadedFilePaths = req.files.map(file => file.path);
                deleteImage(uploadedFilePaths);
            }
            return next(new errorHandler("Cannot create tour, please try again later", 500));
        }

        // Successfully created the tour
        res.status(201).json({
            status: "Success",
            message: `${newTour.name} created successfully`
        });

    } catch (error) {
        // Delete uploaded files immediately on error
        if (req.files) {
            const uploadedFilePaths = req.files.map(file => file.path);
            deleteImage(uploadedFilePaths);
        }
        if (error.code === 11000 || error.code === "E11000") {
            return next(new errorHandler("Tour name already exists", 400));
        }
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
};


// @method PATCH
// @desc:A controller to update the existing data of data base
// @endpoint:localhost:6000/tour-admin/update-tour/:id
module.exports.updateTour = async (req, res, next) => {
    try {
        // id from url
        let id = req.params.id;
        if (!id) return next(new errorHandler("No tour id is given.Please try again.", 400));
        const keys = ["name", "adult_price", "youth_price", "description", "destination", "image", "category", "tour_type", "duration", "discount", "placeName", "active_month", "popularity", "minimumGuest"];

        let updatedData = {};

        // check whether the req.body has valid key
        for (let key in req.body) {
            if (keys.includes(key)) {
                updatedData[key] = req.body[key];
            }
        }
        
        if(req.body.discount){
            if(!isValidNumber(req.body.discount))throw new Error("Please enter valid discount number");//straight to the catch block
            
        }
        let oldPhoto;
        if (req.files) { 
            updatedData.image = req.files.map(file => file.path); // Update image if new file is uploaded
            oldPhoto = await Tour.findById(id, "image");

        }

        
     
        // querying to database
        const updateTour = await Tour.findByIdAndUpdate(id, updatedData, { new: true });
        // console.log(updateTour)
        if (!updateTour || Object.keys(updateTour).length < 0) {
            if (req.files) {
                deleteImage(updatedData.image);
            }
            return next(new errorHandler("Cannot update tour. Please try again later.", 500));
        }

        // Delete old image if a new one was uploaded
        if (req.files && oldPhoto) {
             deleteImage(oldPhoto.image);
           
            // const rootPath = path.dirname(require.main.filename);

            // const oldImagePath = path.join(rootPath, oldPhoto.image);
            // if (fs.existsSync(oldImagePath)) {
            //     fs.rmSync(oldImagePath);
            //     console.log(`Deleted old photo: ${oldImagePath}`);
            // }
        }

        // sending response
        res.status(200).json({
            status: "Success",
            name: updateTour.name,
            updatedData
        });
    } catch (error) {
        if (req.files) {
            const uploadedFilePaths = req.files.map(file => file.path);
            deleteImage(uploadedFilePaths);
        }
        next(new errorHandler(error.message || "Something went wrong.Please try again.", 500));
    }
};

// @method DELETE
// @desc:controller to delete tour
// @endpoint:localhost:6000/tour-admin/delete-tour
module.exports.deleteTour = async (req, res, next) => {
    try {
        // id from url
        const id = req.params.id;
        if (!id) return next(new errorHandler("Tour id is missing.Please try again. ", 400));
        // querying the database
        const del = await Tour.findByIdAndDelete(id);
        if (!del || Object.keys(del).length <= 0) return next(new errorHandler("No Tour found.Please try again.", 404));
        // sending response
        res.status(200).json({
            status: "Success",
            message: `${del.name} deleted .`

        })
    } catch (error) {
        // passing error to the error handling middleware
        next(new errorHandler(error.message, error.statusCode || 500));


    }
}

// @method POST
// @desc:controller to send a message to owner if customer books the tour
// @endpoint:localhost:6000/tour-admin/delete-tour

module.exports.bookTour = async (req, res, next) => {
    try {
        // destructring objects form req.body 
        const { date, phone, email, time, age, nameOfTour } = req.body;
        // if data is missing
        if (!date || !phone || !email || !time || !age || !nameOfTour) return next(new errorHandler("All fields are required.Please fill the form again.", 400));
        // email validation falils
        if (!validateEmail(email)) return next(new errorHandler("Email address is not valid.Please try again.", 400));
        //phone number validation fails
        if (!isValidNepaliPhoneNumber(phone)) return next(new errorHandler("Please enter valid phone number.", 400));
        // create message 
        const message = bookMessage(date, phone, email, time, age, nameOfTour);
        // send message to the email
        await sendMessage(next, message, "Tour booking alert", process.env.personal_message_gmail, "Astrapi Travel");
        // send response
        res.status(200).json({
            status: "Success",
            message: "Thank you for your booking! A confirmation email has been sent to Astrapi Travel and Tour"
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}