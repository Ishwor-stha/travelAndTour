const errorHandling = require("../utils/errorHandling")
const admin = require("../modles/adminModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


// @method GET
// @desc:controller to get all admin
// @endpoint: localhost:6000/admin/get-admins

module.exports.getAllAdmin=async (req,res,next)=>{
    try {
        const allAdmin=await admin.find({},"-_id -password")//exclude _id and password
        if(!allAdmin){
            res.status(200).json({
                status:"sucess",
                message:"No data found"
            })
        }
        res.status(200).json({
            status:"success",
            allAdmin
        })
    } catch (error) {
        return next(new errorHandling(error.message,error.statusCode||400 ))
        
    }
}

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

// const login=(req,res,next)=>{


// }

// @method POST
// @desc:controller to login
// @endpoint: localhost:6000/admin/login-admin

module.exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body

        const user = await admin.findOne({ email })
        if (!user) {
            return next(new errorHandling("Cannot find the user", 400))
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return next(new errorHandling("Incorrect Password", 400))
        }
        const payload = {
            userId: user._id,
            email: user.email
        }
        const token = jwt.sign(payload, process.env.SECRETKEY, { expiresIn: '1h' })
        res.cookie("auth_token", token, {
            httpOnly: true,
            sameSite: "Strict",
            maxAge: 3600 * 1000
        })
        return res.status(200).json({
            status: "success",
            message: `Hello ${user.name}`,
        })
    } catch (error) {

        return next(new errorHandling(error.message, error.statusCode))

    }

}

// @method POST
// @desc:controller to check cookies


module.exports.checkJwt = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return next(new errorHandling("Please login first", 403))

        }
        jwt.verify(token, process.env.SECRETKEY, (err, decode) => {
            if (err) {
                return next(new errorHandling("Your Session Expired please login again", 403))
            }
            req.user = decode

            next()
        })
    } catch (error) {
        return next(new errorHandling(error.message, 400))
    }
}

// @method DELETE
// @desc:controller delete cookie from the user
// @endpoint: localhost:6000/admin/logout-admin

module.exports.logout = (req, res, next) => {
    try {
        res.clearCookie('auth_token', {
            httpOnly: true,
            sameSite: "Strict"
        })
        return res.status(200).json({
            status: "Sucess",
            message: "Logged out sucessfully"
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode))
    }
}

// @method patch
// @desc:controller to create new admin
// @endpoint: localhost:6000/admin/create-admin
module.exports.updateAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId//from checkJwt controller
        let details = ["name", "email", "password", "confirmPassword"]
        let updatedData = {}
        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {

                return next(new errorHandling("Confirm Password or Password doesnot match", 400))


            }

            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            req.body.confirmPassword = undefined

        }



        for (key in req.body) {
            if (details.includes(key)) {
                updatedData[key] = req.body[key]
            }
        }

        const updateUser = await admin.findByIdAndUpdate(userId, updatedData);
        res.status(200).json({
            status: "Success",
            message: "Details changed sucessfully"
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 400))
    }

}
// @method delete
// @desc:controller to delete new admin
// @endpoint: localhost:6000/admin/delete-admin
module.exports.removeAdmin = async(req, res, next) => {
    try {
        if (!req.params.id) {
            return next(new errorHandling("Something went wrong", 400))
        }
        let adminId = req.params.id//from url
        const del = await admin.findByIdAndDelete(adminId)
        if (!del) {
            throw new errorHandling("Something went wrong while deleting admin", 400)
        }
        res.status(200).json({
            status: "Success",
            message: "Admin Deleted"
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 400))

    }

}

// login details
// email:suzankhadka710@gmail.com
// password:HELLOWORLD