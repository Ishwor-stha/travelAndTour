const express = require("express");
const multer=require("multer")
const Router = express.Router();
const tourController = require("../controller/tourController.js");
const { checkJwt } = require("../controller/authController.js");


// for image handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // The folder to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Use a timestamp to avoid overwriting
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];  // Allowed image types
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type, only JPEG, PNG, and JPG are allowed'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1 * 1024 * 1024  // Limit file size to 1MB
    }
});

/*********************************Route****************************************************** */
Router.route("/").get(tourController.homePage);
Router.route("/get-tours").get(tourController.getTours);
Router.route("/tour-admin/post-tour").post(checkJwt, upload.single('image'), tourController.postTour);
Router.route("/tour-admin/update-tour/:id").patch(checkJwt, upload.single('image'), tourController.updateTour);
Router.route("/tour-admin/delete-tour/:id").delete(checkJwt, tourController.deleteTour);

module.exports = Router;
