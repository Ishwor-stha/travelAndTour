const mongoose=require("mongoose");
const slugify=require("slugify");
const tourSchema=new mongoose.Schema({
    name:{
        type:"String",
        required:[true,"Name of prodct  is missing"],
        unique:[true,"Tour name already exists"]
    },
    price:{
        type:Number,
        require:[true,"A Product price is missing"]
    },
    description:{
        type:"String",
        required:[true,"A Product should have Description"]
    },
    destination:{
        type:"String",
        required:[true,"A Tour Must have Destination"]
    },
    image:{
        type:"String",
        required:[true," Photo of Tour is missing"]
    },
    category:{
        type:String,
        required:[true,"Category is missing"]

    },
    type:{
        type:String,
        default:"adventure"
    },
    duration:{
        type: Number,
        required:[true,"Duration is Missing"],
        validate:{
            validator:function(value){
                return typeof value==="number"
            },
            message:"Duration must be a number"
        }
    },
    Discount:{
        type:Number,
        default:0,
        validate:{
            validator:function(discount){
                return typeof discount==="number"
            },
            message:"Discount Must Be In Number"
        }
    },
    slug:{
        type:String
    }

});
tourSchema.pre("save",function(next){
    if(this.isModified("name")){
        this.slug=slugify(this.name);
        next();
    }
    next();

})
tourSchema.pre("findOneAndUpdate",function(next){
    const update=this.getUpdate();
    if(update.name){
        update.slug=slugify(update.name);
    }
    next();
});

const Tour=mongoose.model("tour",tourSchema);
module.exports=Tour;