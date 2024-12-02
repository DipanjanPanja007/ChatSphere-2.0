import { User } from "../models/user.model.js"
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const generateAccessAndRefreshTokens = async (userId) => {
    /*
     * generate Access and Refresh Token,
     * Update refresh Token into db ( just update refreshToken, else untouched )
     * return Access and Refresh Token
     */

    try {
        const user = await User.findById(userId);

        // generate Access and Refresh Token,
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Update refresh Token into db 
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // return Access and Refresh Token
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating Access and Refresh Token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {

    /*
     * step#1: take input name, email, password... validation them -> not empty
     * step#2: make sure for same user already not exists 
     * step#3: check for profilePicture given or not... ( from middleware )
     * step#4: create User object and send it after removing credentials
     */

    // step#1: take input name, email, password... 
    const { name, email, password } = req.body;          // remove pic as we will send it through middleware

    // step#2: if any one not found, throw error: validation - not empty
    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required...");
    }


    // step#2: make sure for same user already not exists 
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, `User with email: ${email} already exists`)
    }

    // step#3: check for profilePicture given or not... ( from middleware )

    // console.log("req.file: ", req.file);
    let profilePicPath = "";
    if (req.file) {
        profilePicPath = req.file.path;
    }
    // console.log("pf path: ", profilePicPath);
    let profilePic = ""
    if (profilePicPath) {
        const picName = req.file?.filename;
        profilePic = await uploadOnCloudinary(profilePicPath, picName);
    }


    // step#4: create User object and send it after removing credentials
    const user = await User.create({
        name: name,
        email: email,
        password: password,
        profilePic: profilePic?.url || undefined,
    });

    // if user not created, throw error
    if (!user) {
        throw new ApiError(400, "User creation failed ... ")
    }
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Step#8: check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something is wrong while registering you...");
    }

    // return info
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
});

const loginUser = asyncHandler(async (req, res) => {

    /*
     * step#1: take input name, email, password... validation them -> not empty 
     * step#2: find user with given email
     * step#3: if user found, match password
     * step#4: generate accessToken and refreshToken, so User in db updated
     * step#5: set accessToken in Barer Authentication token 
     * step#6: set cookies for tokens and send User, removing credentials
     */

    // step#1: take input name, email, password... validation them -> not empty 
    const { email, password } = req.body

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required...");
    }
    // console.log(`from authUser, email: ${email} and password: ${password}`);

    // step#2: find user with given email
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, `User with email ${email} doesn't exists `);
    }

    // step#3: if user found, match password
    const checkPassword = await user.isPasswordCorrect(password);

    if (!checkPassword) {
        throw new ApiError(400, "Incorrect password");
    }
    // console.log(user._id);

    // step#4: generate accessToken and refreshToken , so User in db updated
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );


    //  removing credentials from User object
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true, // cookie can be modified by server only
        secure: true,
    };

    // step#5: set accessToken in Barer Authentication token 
    res.setHeader('Authorization', `Bearer ${accessToken}`);

    // step#6: set cookies for tokens and send User
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                },
                "User logged In Successfully"
            )
        )

});

const allUsers = asyncHandler(async (req, res) => {

    /* @description     Get or Search all users by name or email ( except me )
     * @route           GET /api/user?search=XYZ {NAME OR EMAIL PORTION}
     */
    /*
     * step#1: find keyword by which searched . here XYZ
     * step#2: find user(s) by keyword
     * step#3: send users object. If not found, send empty object
     */


    // step#1: find keyword by which searched . here XYZ
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    // step#2: find user(s) by keyword
    const users = await User
        .find(keyword)
        .find({ _id: { $ne: req.user._id } })
        .select("-password")

    // console.log(users);

    // step#3: send users object. If not found, send empty object
    return res
        .status(200)
        .json({
            "data": { users },
            "message": "users found successfully"
        })
})

export { registerUser, loginUser, allUsers }