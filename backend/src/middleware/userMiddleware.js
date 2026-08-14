const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const redisClient = require("../config/redis")
const AppError = require("../utils/AppError");

const userMiddleware = async (req,res,next)=>{

    try{
        
        const {token} = req.cookies;
        if(!token)
            throw new AppError("Authentication required.", 401, "AUTHENTICATION_ERROR");

        let payload;
        try {
            payload = jwt.verify(token,process.env.JWT_KEY);
        } catch (error) {
            throw new AppError("Authentication required.", 401, "AUTHENTICATION_ERROR");
        }

        // Redis ke blockList mein persent toh nahi hai

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new AppError("Authentication required.", 401, "AUTHENTICATION_ERROR");

        const {_id} = payload;

        if(!_id){
            throw new AppError("Authentication required.", 401, "AUTHENTICATION_ERROR");
        }

        const result = await prisma.user.findUnique({
            where: { id: _id }
        });

        if(!result){
            throw new AppError("Authentication required.", 401, "AUTHENTICATION_ERROR");
        }

        req.result = result;


        next();
    }
    catch(err){
        if (err instanceof AppError) return next(err);
        next(new AppError("Authentication service is unavailable.", 503, "EXTERNAL_SERVICE_ERROR"));
    }

}


module.exports = userMiddleware;
