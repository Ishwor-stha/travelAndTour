const express = require("express");
const upload = require("../utils/multer.js");
const Router = express.Router();
const tourController = require("../controller/tourController.js");
const { checkJwt } = require("../controller/authController.js");


/*********************************Route****************************************************** */
Router.route("/get-tours").get(tourController.getTours);

Router.route("/tour-admin/post-tour").post(checkJwt, upload.single('image'), tourController.postTour);

Router.route("/tour-admin/update-tour/:id").patch(checkJwt, upload.single('image'), tourController.updateTour);

Router.route("/tour-admin/delete-tour/:id").delete(checkJwt, tourController.deleteTour);

Router.route("/get-tour/:slug").get(tourController.getOneTour);

module.exports = Router;
