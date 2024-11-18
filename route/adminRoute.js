const express=require("express")
const  admin  = require("../controller/authController")
const Router=express.Router()

Router.route("/create-admin/").post(admin.createAdmin)
// Router.route("/delete").delete(admin.deleteAll)


module.exports=Router