const Tour = require("../modles/tourModel")
module.exports.homePage=(req,res)=>{
    res.status(200).json({
        status:"Success",
        message:"This is main page"
    })
}

//@method :GET 
//@Endpoint: localhost:6000/get-tours
//@desc:Getting the array of  of tours in object
module.exports.getTours = async (req, res) => {
    try {
        // variable for sorting
        let sort;

        // let query={}
        let condition = [];

        // destructring query parameters
        let { destination, category, type, duration } = req.query;

        // Handling the sorting logic
        if (req.query.price) {
            sort = req.query.price === "asc" ? 1 : -1;
        }

        // Building the condition for $or condition
        if (destination) condition.push({ destination: destination });
        if (category) condition.push({ category: category });
        if (type) condition.push({ type: type });
        if (duration) condition.push({ duration: duration });

        

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

        if (tour.length>0) {
            res.status(200).json({
                status: "Success",
                tourList: tour
            });
        } else {
            res.status(200).json({
                status:"Success",
                tourList:"No tour found"
            })
        }
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error.message
        });
    }
};

//@EndPoint:localhost:6000/post-tour
//@method:POST
//@desc:Adding the tours
module.exports.postTour=async (req,res)=>{
    try {
      
        const newTour=await Tour.create(req.body);
        res.status(201).json({
            status:"Success",
            NewTourDetails:newTour
            
        })
        } catch (error) {
            res.status(500).json({
                status:"Failed",
                message:error.message
            })
            
        }
}