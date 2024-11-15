const dotenv = require('dotenv');
const express=require("express");
const mongoose=require("mongoose")
const tourRoute=require("./route/tourRoute");
const errorController = require('./controller/errorController');
const app=express();
dotenv.config()
app.use(express.json())
async function databaseConnect() {
    try {
        
        await mongoose.connect(process.env.DATABASE)
        console.log("Database connected")
        
    } catch (error) {
       console.log(`Error connecting database \n${error}`)
    }
    
    
}
databaseConnect();

app.use("/",tourRoute);
app.all("*",(req,res)=>{
    res.status(400).json({
        status:"fail",
        message:"Invalid website path"
    })

})
app.use(errorController)

const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)

})