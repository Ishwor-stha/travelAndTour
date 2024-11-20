const errorHandling = require("../utils/errorHandling")
const admin = require("../modles/adminModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const validator = require("validator"); // We'll use this to validate the email format
const crypto = require('crypto')
const nodemailer = require("nodemailer");
const { error } = require("console");


// @method GET
// @desc:controller to get all admin
// @endpoint: localhost:6000/admin/get-admins

module.exports.getAllAdmin = async (req, res, next) => {
    try {
        const allAdmin = await admin.find({}, "-_id -password")//exclude _id and password
        if (!allAdmin) {
            res.status(200).json({
                status: "sucess",
                message: "No data found"
            })
        }
        res.status(200).json({
            status: "success",
            allAdmin
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 400))

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
module.exports.removeAdmin = async (req, res, next) => {
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
// @endpoint:localhost:6000/admin/forget-password
// @desc:forget password also send gmail
// @method:POST

module.exports.forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body
        const isEmail = validator.isEmail(email)
        const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
        const emailDomain = email.split('@')[1]; // Get the part after '@'
        const valid = allowedDomains.includes(emailDomain);

        if (!isEmail || !valid) {
            return next(new errorHandling("Please enter valid email address", 400))
        }

        const findMail = await admin.findOne({ email }, " -password -name")//exclude _id ,password and name
        if (!findMail) {
            return next(new errorHandling("Email not found", 404))
        }

        // message part
        const resetToken = await crypto.randomBytes(16).toString('hex')

        await admin.findByIdAndUpdate(findMail._id, { "code": resetToken })
        // Create the reset link
        const resetLink = `${process.env.URL}/reset-password/${resetToken}`  // Use full URL (including 'http://')
        // Construct the email message
        const message = `
        <p>Hello,</p>
        <p>We received a request to reset your password. Please click the link below to reset your password:</p>
        <p><a href="${resetLink}" target="_blank">Reset Password</a></p> <!-- Added target="_blank" to open in a new tab -->
        <p>If you did not request this, please ignore this email.</p>
        `


        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.gmailUser,
                pass: process.env.gmailPassword
            }
        });

        let mailOptions = await {
            from: 'suzankhadka710@gmail.com',
            to: findMail.email,
            subject: 'Reset link',
            html: message
        };

        transporter.sendMail(mailOptions, await function (error, info) {
            if (error) {
                return next(new errorHandling(error.message, error.statusCode || 500))
            } else {
                console.log('Email sent: ' + info.response)
                res.status(200).json({
                    message: "Password Reset Email  Send"
                })
            }
        });

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 400))
    }
}
// @desc: reset link with code
// @method: PATCH
// @endpoint:localhost:6000/reset-password/:code

module.exports.resetPassword = async (req, res, next) => {
    try {
        if (!req.body.password || !req.body.confirmPassword) {
            return next(new errorHandling("Please fill out the form", 400))
        }
        let { password, confirmPassword } = req.body
        if (password !== confirmPassword) {
            return next(new errorHandling("Password or confirm password do not match", 400))

        } else {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            req.body.confirmPassword = undefined
        }
        if (!req.params.code) {
            return next(new errorHandling("Unauthorized", 400))
        }

        let code = req.params.code
        let adminCode = await admin.findOne({ code })
        if (!adminCode) {
            return next(new errorHandling("Code expired", 404))
        }

        await admin.findByIdAndUpdate(adminCode._id, {"password":req.body.password})

        res.status(200).json({
            status: "sucess",
            message: "Changed sucessfully"
        })


    } catch (error) {
        return next(new errorHandling("Something went wrong", error.statusCode || 500))
    }
}
