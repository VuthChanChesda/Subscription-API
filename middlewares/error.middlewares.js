const errorMiddleware = (err, req, res, next) => {
    
    try{

        let error = { ...err };
        error.message = err.message;
        console.error(err);

        // Handle unmatched routes (404 errors)
        if (!err.statusCode && !err.message) {
            error = new Error("API URL not found");
            error.statusCode = 404;
        }             

        //Mongoose bad ObjectId
        if(err.name === "CastError"){
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new Error(message);
            error.statusCode = 404;
        }
        //Mongoose duplicate key
        if(err.code === 11000){
            const message = `Duplicate field value entered`;
            error = new Error(message);
            error.statusCode = 400;
        }

        //Mongoose validation error
        if(err.name === "ValidationError"){
            const message = Object.values(err.errors).map(val => val.message); //map over err oject cus we might have multiple validation errors then show message for each
            error = new Error(message.join(", ")); //join the array into a string
            error.statusCode = 400;
        }

        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Server Error"
        });

    }
    catch(err){
        next(err);
    }
};

export default errorMiddleware;