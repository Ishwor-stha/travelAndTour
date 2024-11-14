const express=require("express")
const Router=express.Router()
const tourController=require("../controller/tourController.js")
Router.route("/").get(tourController.homePage)
Router.route("/get-tours").get(tourController.getTours)
Router.route("/post-tour").post(tourController.postTour)


module.exports=Router