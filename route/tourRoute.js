const express=require("express")
const Router=express.Router()
const tourController=require("../controller/tourController.js")
const { checkJwt } = require("../controller/authController.js")
Router.route("/").get(tourController.homePage)
Router.route("/get-tours").get(tourController.getTours)
Router.route("/tour-admin/post-tour").post(checkJwt, tourController.postTour)
Router.route("/tour-admin/update-tour/:id").patch(checkJwt, tourController.updateTour)
Router.route("/tour-admin/delete-tour/:id").delete(checkJwt,tourController.deleteTour)


module.exports=Router