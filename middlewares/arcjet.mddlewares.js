import aj from "../config/arcjet.js";

export default async function arcjetMiddleware(req, res, next) {

    try{
        const decision = await aj.protect(req , {requested: 1});

        if (decision.isDenied()) {
            if(decision.reason.isBot()) return res.status(403).json({error: "Bot Detected haaha"});
            if(decision.reason.isRateLimit()) return res.status(429).json({error: "Rate Limit Exceeded"});
            // Blocked by Arcjet
            return res.status(403).json({error: "Access Denied"});
        } else {
            // Not blocked, continue to the next middleware
            next();
        }
    }
    catch (error) {
        console.error(`Error in arcjet middleware:${error}`);
        next(error);
    }

}

