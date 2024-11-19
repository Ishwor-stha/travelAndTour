const express=require("express")
const  admin  = require("../controller/authController")

const Router=express.Router()

Router.route("/create-admin/").post(admin.checkJwt,admin.createAdmin)
// Router.route("/delete").delete(admin.deleteAll)
Router.route("/login-admin/").post(admin.login)
Router.route("/logout-admin/").post(admin.checkJwt,admin.logout)
Router.route("/update-admin/").patch(admin.checkJwt, admin.updateAdmin)
Router.route("/remove-admin/:id").delete(admin.checkJwt, admin.removeAdmin)





module.exports=Router