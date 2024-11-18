const errorHandling = require("../utils/errorHandling")

const admin = require("../modles/adminModel")

// @method POST
// @desc:controller to create new admin
// @endpoint: localhost:6000/admin/create-admin

module.exports.createAdmin = async (req, res, next) => {
    try {
        // destructuring the fields from req.body
        const { name, password, confirmPassword, email } = req.body;

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            next(new errorHandling("Password or confirm password do not match", 400))

        }

        // Create new admin in the database
        const newAdmin = await admin.create({
            name,
            password,
            confirmPassword,
            email
        });

        // await newAdmin.save();  // Save the admin

        // Respond with success
        res.status(201).json({
            status: "Success",
            message: "Account created successfully"
        });
    } catch (error) {
        // Catch validation errors or other errors
        if (error.name === "ValidationError") {
            console.log("\n")

            console.log("validation Error")
            return next(new errorHandling(error, 400))
        }
        // catch duplicate key error
        if (error.code === 11000) {

            // Unique constraint violation (e.g., duplicate name or email)
            return next(new errorHandling("Please try a different name or email", 400))

        }

        //(server errors)


        return next(new errorHandling("Something went wrong on the server", 500))

    }
};

// unnecessary controller delete this after testing
// module.exports.deleteAll =async  (req, res) => {
//     try {
//         const deletes =await  admin.deleteMany({})
//         res.json({
//             stauts: "deleted"
//         })

//     } catch (error) {
//         next(new errorHandling(error,400))
//     }
// }
