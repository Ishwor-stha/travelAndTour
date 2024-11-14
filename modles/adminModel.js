const mongoose=require("mongoose")
const adminSchema=mongoose.Schema({
    name:{
        type:"String",
        require:[true,"Name is Missing"],
        unique:[true,"Name already exists ! please try another name"]
    },
    password:{
        type:"String",
        require:[true,"Password Is Missing"],
        min:[8,"A password must have minimum of 8 character"]
    },
    confirmPassword:{
        type:"String",
        require:[true,"Confirm Password Is Missing"],
        validate:{
            validator:function(confirmPassword){
                        return confirmPassword==this.password

                    },
            message:"A Password and Confirm Password Doesnot match"
        }
    }
})
const adminModel=mongoose.model("admin",adminSchema)

module.exports=adminModel