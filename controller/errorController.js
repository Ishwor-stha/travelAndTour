module.exports=(err,req,res,next)=>{
    // all the error details comes from the user through ../utils/error handling
    if(process.env.NODE_ENV=="development"){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
            detail:err.stack
    
        });

    }else{
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
          
        });
    }
    
}
