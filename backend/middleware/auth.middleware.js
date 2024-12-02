import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import asyncHandler from "express-async-handler"
import { ApiError } from "../utils/ApiError.js"


const verifyJWT = asyncHandler(async (req, _, next) => {
    /*
     * step#1: find accessToken in cookies or Bearer Authentication token in header
     * step#2: if token not found, or wrong token found-> send error 
     * step#3: decode token and from userId, access User 
     * step#4: if verified user so, save user to req.user and go on
     */

    try {
        const token =
            req.cookies.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request !!! ")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // console.log("decoded token: ", decodedToken);


        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error ? error.message : "Invalid access Token ");
    }


});

export { verifyJWT }