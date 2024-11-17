const express=require("express")
const Router=express.Router()
const tourController=require("../controller/tourController.js")
Router.route("/").get(tourController.homePage)
Router.route("/get-tours").get(tourController.getTours)
Router.route("/tour-admin/post-tour").post(tourController.postTour)
Router.route("/tour-admin/update-tour/:id").patch(tourController.updateTour)
Router.route("/tour-admin/delete-tour/:id").delete(tourController.deleteTour)


module.exports=Router