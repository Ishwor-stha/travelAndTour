const Tour = require("../modles/tourModel");
const errorHandler = require("../utils/errorHandling")
module.exports.homePage = (req, res) => {
    res.status(200).json({
        status: "Success",
        message: "This is main page"
    })
}

//@method :GET 
//@Endpoint: localhost:6000/get-tours
//@desc:Getting the array of  of tours in object
module.exports.getTours = async (req, res, next) => {
    try {
        // variable for sorting
        let sort;

        // let query={}
        let condition = [];

        // destructuring query parameters
        let { destination, category, type, duration, name } = req.query;

        // Handling the sorting logic
        if (req.query.price) {
            sort = req.query.price === "asc" ? 1 : -1;
        }

        // Building the condition for $or condition
        // new RegExp("pattern",flags) object is used to make a data case insensitive "i" stands for insensitive  
        if (destination) condition.push({ destination: new RegExp(destination, 'i') });//i.e{ destination: /mustang/i }
        if (category) condition.push({ category: new RegExp(category, 'i') });
        if (type) condition.push({ type: new RegExp(type, 'i') });
        if (duration) condition.push({ duration: duration });
        if (name) condition.push({ name: new RegExp(name, 'i') });
        // console.log(condition)

        // Fetching the data from the database using $or condition for flexible matching
        let tourQuery = Tour.find();

        if (condition.length > 0) {
            // Use $or if any of the conditions are provided
            tourQuery = tourQuery.where({ $or: condition });
        }

        // If sorting by price 
        if (req.query.price) {
            tourQuery = tourQuery.sort({ price: sort });
        }

        const tour = await tourQuery;
        // if there is is tour 
        if (tour.length > 0) {
            res.status(200).json({
                status: "Success",
                tourList: tour
            });
        } else {//if there is no tour
            res.status(200).json({
                status: "Success",
                tourList: "No tour found"
            });
        }
    } catch (error) {
        // res.status(404).json({
        //     status: "Failed",
        //     message: error.message
        // });
        // passing erorr to the error handling middleware
        next(new errorHandler(error, 404))



    }
};




//@EndPoint:localhost:6000/tour-admin/post-tour
//@method:POST
//@desc:Adding the tours
module.exports.postTour = async (req, res, next) => {
    try {
        let data = {}
        let keys = ["name", "price", "description", "destination", "image", "category", "type", "duration", "discount"]
        //appling best practice to insert data by filtering
        for (let key in req.body) {
            // checks whether the req.body has the appropriate key
            if (keys.includes(key)) {
                // checking if the data is number or string
                if (typeof req.body[key] === "number") {
                    data[key] = req.body[key]

                }
                else {
                    // if the data is not number then convert it to the string for security concern
                    data[key] = req.body[key].toString()
                }


            }
        }
        if (req.file) {
            data.image = req.file.path;  // Multer provides the file path (e.g., "uploads/1622492839145.jpg")
          }
      
        // querying to the database
        const newTour = await Tour.create(data);
        res.status(201).json({
            status: "Success",
            NewTourDetails: newTour

        })
    } catch (error) {
        // res.status(500).json({
        //     status: "Failed",
        //     message: error.message
        // })
        // passing error to the error handling middleware
        next(new errorHandler(error, 500))

    }
}

// @method PATCH
// @desc:A controller to update the existing data of data base
// @endpoint:localhost:6000/tour-admin/update-tour/:id
module.exports.updateTour = async (req, res, next) => {
    try {
        // id from url
        let id = req.params.id;
        let keys = ["name", "price", "description", "destination", "image", "category", "type", "duration", "discount"];
        let updatedData = {};
        // check whether the req.body has valid key
        for (let key in req.body) {
            if (keys.includes(key)) {
                // adding new object to the empty object variables
                updatedData[key] = req.body[key]
            }
        }
        if (req.file) {
            updatedData.image = req.file.path; // Update image if new file is uploaded
          }
        // querying to database
        const updateTour = await Tour.findByIdAndUpdate(id, updatedData);
        // sending response
        res.status(200).json({
            status: "Success",
            name:updateTour.name,
            updatedData

        })
    } catch (error) {
        // passing error to the error handling middleware
        next(new errorHandler(error, 400));

    }
}

// @method DELETE
// @desc:controller to delete tour
// @endpoint:localhost:6000/tour-admin/delete-tour
module.exports.deleteTour = async (req, res, next) => {
    try {
        // id from url
        const id = req.params.id;
        // querying the database
        const del = await Tour.findByIdAndDelete(id)
        // sending response
        res.status(200).json({
            status: "Success",
            message: `${del.name} deleted`

        })
    } catch (error) {
        // passing error to the error handling middleware
        next(new errorHandler(error, 401))


    }
}