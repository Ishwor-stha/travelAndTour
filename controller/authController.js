const errorHandling = require("../utils/errorHandling")
const admin = require("../modles/adminModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const validator = require("validator"); // We'll use this to validate the email format
const crypto = require('crypto')
const { validateEmail } = require("../utils/emailValidation");
const { messages } = require("../utils/message");
const sendMessage = require("../utils/sendMessage");



// @method GET
// @desc:controller to get all admin
// @endpoint: localhost:6000/admin/get-admins

module.exports.getAllAdmin = async (req, res, next) => {
    try {
        const allAdmin = await admin.find({}, "-_id -password")//exclude _id and password
        // if there is no admin
        if (!allAdmin) {
            res.status(404).json({
                status: "sucess",
                message: "No data found"
            })
        }
        res.status(200).json({
            status: "success",
            allAdmin
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500))

    }
}

// @method POST
// @desc:controller to create new admin
// @endpoint: localhost:6000/admin/create-admin

module.exports.createAdmin = async (req, res, next) => {
    try {
        // if there is no password and confirm password
        if (!req.body.password || !req.body.confirmPassword) {
            return next(new errorHandling("Confirm password or password is missing", 400));
        }
        // destructuring the fields from req.body
        const { name, password, confirmPassword, email } = req.body;
        // no name and email
        if (!name || !email) {
            return next(new errorHandling("Name and Email are required", 400));
        }


        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return next(new errorHandling("Password or confirm password do not match", 400))

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
            // console.log("\n")

            return next(new errorHandling(error, 422))
        }
        // catch duplicate key error
        if (error.code === 11000) {

            // Unique constraint violation (e.g., duplicate name or email)
            return next(new errorHandling("Please try a different name or email", 409))

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
        // destrcturing
        let { email, password } = req.body
        // if no email and password
        if (!email || !password) {
            return next(new errorHandling("Email or password is missing", 400))
        }

        // check email validation 
        if (!validateEmail(email)) {
            return next(new errorHandling("Please enter valid email address", 400))
        }

        // fetch data from email
        const user = await admin.findOne({ email })
        // no data
        if (!user) {
            return next(new errorHandling("Cannot find the user", 404))
        }
        // compare password
        const isMatch = await bcrypt.compare(password, user.password)
        // match fails
        if (!isMatch) {
            return next(new errorHandling("Incorrect Password", 400))
        }


        const payload = {
            userId: user._id,
            email: user.email
        }
        // generate jwt token
        const token = jwt.sign(payload, process.env.SECRETKEY, { expiresIn: process.env.jwtExpires })
        // send token and store on cookie
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

        return next(new errorHandling(error.message, error.statusCode || 500))

    }

}

// @method POST
// @desc:controller to check cookies


module.exports.checkJwt = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        // no token
        if (!token) {
            return next(new errorHandling("Please login first", 403))

        }
        // check token
        jwt.verify(token, process.env.SECRETKEY, (err, decode) => {
            if (err) {
                return next(new errorHandling("Your Session Expired or invalid token login again", 403))
            }
            req.user = decode

            next()
        })
    } catch (error) {
        return next(new errorHandling(error.message, 500))
    }
}

// @method DELETE
// @desc:controller delete cookie from the user
// @endpoint: localhost:6000/admin/logout-admin

module.exports.logout = (req, res, next) => {
    try {
        //clear the cookie from browser
        res.clearCookie('auth_token', {
            httpOnly: true,
            sameSite: "Strict"
        })
        return res.status(200).json({
            status: "Sucess",
            message: "Logged out sucessfully"
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500))
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

        // 
        if (req.body.email) {
            //validate email 
            if (!validateEmail(req.body.email)) {
                return next(new errorHandling("Please enter valid email address", 400))
            }

        }

        if (req.body.password) {
            // validate password
            if (!req.body.password || !req.body.confirmPassword) {
                return next(new errorHandling("Confirm password of password is missing", 400));
            }
            // compare password
            if (req.body.password !== req.body.confirmPassword) {

                return next(new errorHandling("Confirm Password or Password doesnot match", 400))


            }
            // create password hash
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            req.body.confirmPassword = undefined

        }


        // itereate every object of req.body
        for (key in req.body) {
            // check the key macthes to the object of req.body
            if (details.includes(key)) {
                updatedData[key] = req.body[key]
            }
        }
        // update the data in databse
        const updateUser = await admin.findByIdAndUpdate(userId, updatedData);
        // no user
        if (!updateUser) {
            return next(new errorHandling("User not found", 404))
        }
        res.status(200).json({
            status: "Success",
            message: "Details changed sucessfully"
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500))
    }

}
// @method delete
// @desc:controller to delete new admin
// @endpoint: localhost:6000/admin/delete-admin
module.exports.removeAdmin = async (req, res, next) => {
    try {
        if (!req.params.id) {
            return next(new errorHandling("Something went wrong", 400))
        }
        let adminId = req.params.id//from url
        const del = await admin.findByIdAndDelete(adminId)
        // no admin
        if (!del) {
            throw new errorHandling("Admin not found", 404)
        }
        res.status(200).json({
            status: "Success",
            message: "Admin Deleted"
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500))

    }

}
// @endpoint:localhost:6000/admin/forget-password
// @desc:forget password also send gmail
// @method:POST

module.exports.forgotPassword = async (req, res, next) => {
    try {
        // destructuring
        let { email } = req.body
        // validate email
        if (!validateEmail(email)) {
            return next(new errorHandling("Please enter valid email address", 400))
        }
        // check email in database
        const findMail = await admin.findOne({ email }, " -password")//exclude _id ,password and name
        // no email
        if (!findMail || Object.keys(findMail).length <= 0) {
            return next(new errorHandling("Email not found", 404))
        }

        //                               message part
        //generate  token
        const resetToken = await crypto.randomBytes(16).toString('hex')

        // Set expiration time (e.g., 1 hour from now)
        const expirationTime = Date.now() + 900000; // 15 minutes in milliseconds
        // update code and expiry time
        await admin.findByIdAndUpdate(findMail._id, { "code": resetToken, "resetExpiry": expirationTime })
        // Create the reset link
        const resetLink = `${process.env.URL}/admin/reset-password/${resetToken}`  // Use full URL (including 'http://')
        console.log(resetLink)
        // Construct the email message
        const message = messages(resetLink);
        await sendMessage(next, message, "Reset link", findMail.email, findMail.name)

        res.status(200).json({
            status: "Success",
            message: "Password Reset Email Send"
        })

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 400))
    }
}
// @desc: reset link with code
// @method: PATCH
// @endpoint:localhost:6000/reset-password/:code
module.exports.resetPassword = async (req, res, next) => {
    try {
        // Check if password and confirmPassword are provided
        if (!req.body.password || !req.body.confirmPassword) {
            return next(new errorHandling("Confirm password of password is missing", 400));
        }
        // destructuring
        let { password, confirmPassword } = req.body;

        // Check if the password and confirmPassword match
        if (password !== confirmPassword) {
            return next(new errorHandling("Password and confirm password do not match", 400));
        } else {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            // Remove confirmPassword from the request body
            req.body.confirmPassword = undefined;
        }

        // Check if reset code is provided
        if (!req.params.code) {
            return next(new errorHandling("Unauthorized: Reset code missing", 400));
        }

        let code = req.params.code;

        // Find the admin using the reset code
        let adminCode = await admin.findOne({ code });
        // no admin
        if (!adminCode) {
            return next(new errorHandling("Code expired or invalid", 400));
        }

        // Check if the reset code has expired
        const currentDate = Date.now();
        // if time of database is lower than current time
        if (currentDate > adminCode.resetExpiry) {
            // Clear expired reset code fields
            adminCode.resetExpiry = undefined;
            adminCode.code = undefined;
            // dave data in database
            await adminCode.save();

            // Return error response for expired code
            return next(new errorHandling("Code has expired. Please request a new one.", 404));
        }

        // Update the admin's password and clear reset fields
        const changeAdmin = await admin.findByIdAndUpdate(
            adminCode._id,
            {
                "password": req.body.password,

            },
            {
                new: true // Return the updated document
            }
        );
        // after updating reset the expiry date and code

        changeAdmin.resetExpiry = undefined;
        changeAdmin.code = undefined;
        // saving changes in database
        await changeAdmin.save();


        if (!changeAdmin) {
            return next(new errorHandling("Error updating password", 500));
        }

        // Return success response
        res.status(200).json({
            status: "success",
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        return next(new errorHandling("Something went wrong", error.statusCode || 500));
    }
};
