const Tour = require("../modles/tourModel");
const errorHandling = require("../utils/errorHandling");
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

        if (tour.length > 0) {
            res.status(200).json({
                status: "Success",
                tourList: tour
            });
        } else {
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
        next(new errorHandler(error, 404))



    }
};


//@EndPoint:localhost:6000/post-tour
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
                if (typeof req.body.key === "number") {
                    data[key] = req.body[key]

                }
                else {
                    // if the data is not number then convert it to the string for security concern
                    data[key] = req.body[key].toString()
                }


            }
        }
        // double check if the data.name is string or not
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
        next(new errorHandler(error, 500))

    }
}