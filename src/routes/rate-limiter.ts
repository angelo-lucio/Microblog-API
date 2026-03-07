import rateLimit from "express-rate-limit";


export const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 1000, // Limit each IP to 1000 
legacyHeaders: false,
statusCode: 429,
message: {
    error: "Too many requests. Please try later."
}
})