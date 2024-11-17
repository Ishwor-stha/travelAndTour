const errorHandling = require("../utils/errorHandling")

const admin = require("../models/adminModel")

// @method POST
// @desc:controller to create new admin
// @endpoint: localhost:6000/tour-admin/createAdmin
module.exports.createAdmin = (req, res, next) => {
    try {
        const { name, password, confirmPassword, email } = req.body
        const createAdmin = admin.create({
            "name": name,
            "password": password,
            "email": email,
            "confirmPassword": null
        })
        res.status(200).json({
            stauts: "Success",
            message: "Account created Successfully"
        })
    } catch (error) {
        next(new errorHandling(error,400))

    }
}