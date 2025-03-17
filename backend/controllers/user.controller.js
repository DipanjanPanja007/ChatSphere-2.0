import { User } from "../models/user.model.js"
import { MemoryOtp } from "../models/memoryOtp.model.js"
import asyncHandler from "express-async-handler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendMail } from "../config/sendMail.js";



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
        res
            .status(500)
            .json({
                message: "Something went wrong while generating tokens"
            })
    }
};

const generateOTP = () => {
    const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += chars[Math.floor(Math.random() * 36)];
    }
    return otp;
}

const reqOTP = asyncHandler(async (req, res) => {

    /*
     * step#1: take email from req.body
     * step#2: make sure for same user already not exists 
     * step#3: generate OTP
     * step#4: send OTP to email
     * step#5: save email and OTP in memoryOtp collection
     * step#6: send response
     */

    // step#1: take email from req.body
    const { email } = req.body;
    console.log(`email received: ${email}`);

    // step#2: make sure for same user already not exists 
    const userExists = await User.findOne({ email });
    if (userExists) {
        res
            .status(400)
            .json({
                message: `User with email: ${email} already exists`
            })
    }

    // step#2: generate OTP
    let otp = generateOTP();
    console.log(`OTP : ${otp}`);

    // step#3: send OTP to email
    sendMail(email, otp);

    // step#4: save email and OTP in memoryOtp collection
    let otpExists = await MemoryOtp.findOne({ email });
    if (otpExists) {                                          // if already exists, delete it
        await MemoryOtp.findOneAndDelete({ email });
    }
    let otpPlaced = await MemoryOtp.create({ email, otp });

    if (!otpPlaced) {
        res
            .status(500)
            .json({
                message: "Something went wrong while sending OTP"
            })
    }

    // step#5: send response
    return res
        .status(200)
        .json({
            email: email,
            messgae: "OTP sent successfully",
        })
});

const registerUser = asyncHandler(async (req, res) => {

    /*
     * step#1: take input name, email, password, otp ... validation them -> not empty
     * step#2: check if OTP is correct or not
     * step#3: check for profilePicture given or not... ( from middleware )
     * step#4: create User object and send it after removing credentials
     */

    // step#1: take input name, email, password... 
    const { name, email, password, otp } = req.body;          // remove pic as we will send it through middleware
    // console.log(`name: ${name}, email: ${email}, password: ${password}, otp: ${otp}`);

    // if any one not found, throw error: validation - not empty
    if ([name, email, password, otp].some((field) => field?.trim() === "")) {
        res
            .status(400)
            .json({
                user: null,
                message: "All fields are required..."
            });
    }




    // step#2: check if OTP is correct or not
    const otpExists = await MemoryOtp.findOne({ email });

    if (!otpExists) {                // if otp expired or not exists
        return res
            .status(400)
            .json(
                null,
                "OTP expired, try again..."
            )
    }

    if (otpExists.otp !== otp) {       // if wrong otp
        return res
            .status(400)
            .json({
                message: "Incorrect OTP, try again..."
            })
    }


    // step3#: check for profilePicture given or not... ( from middleware )

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
        res
            .status(400)
            .json({
                user: null,
                message: "User creation failed "
            });
    }
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Step#5: check for user creation
    if (!createdUser) {
        res
            .status(500)
            .json({
                user: null,
                message: "Something went wrong while creating user"
            });
    }

    // return info
    return res
        .status(200)
        .json({
            user: createdUser,
            messagge: "User registered successfully"
        })
});

const registerByGoogle = asyncHandler(async (req, res) => {

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
        res
            .status(400)
            .json({
                user: null,
                message: "All fields are required..."
            });
    }
    // console.log(`from authUser, email: ${email} and password: ${password}`);

    // step#2: find user with given email
    const user = await User.findOne({ email });
    console.log("user: ", user);
    if (!user) {
        res.status(400).json({
            user: null,
            message: "User not found"
        });
    }

    // step#3: if user found, match password
    const checkPassword = await user.isPasswordCorrect(password);

    if (!checkPassword) {
        res
            .status(400)
            .json({
                user: null,
                message: "Incorrect password"
            });
    }
    // console.log(user._id);

    // step#4: generate accessToken and refreshToken , so User in db updated
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );


    //  removing credentials from User object
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ).lean();

    loggedInUser.accessToken = accessToken;

    console.log("loggedInUser: ", loggedInUser);

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
        .json({
            user: loggedInUser
        })

});

const loginByGoogle = asyncHandler(async (req, res) => {

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
            users,
            "message": "users found successfully"
        })
});

const updateProfilePic = asyncHandler(async (req, res) => {
    /*
     * step#1: check for profilePicture given or not... ( from middleware )
     * step#2: upload new profile pic on cloudinary
     * step#3: delete old profile pic from cloudinary
     * step#4: update profilePic in User collection
     */

    // step#1: check for profilePicture given or not... ( from middleware )
    console.log("req.file: ", req.file);
    let profilePicPath = "";
    if (req.file) {
        profilePicPath = req.file.path;
    } else {
        res
            .status(400)
            .json({
                message: "Profile picture not found"
            })
    }
    console.log("pf path: ", profilePicPath);

    // step#2: upload new profile pic on cloudinary
    let profilePic = "";
    if (profilePicPath) {
        profilePic = await uploadOnCloudinary(profilePicPath, req.file.filename);
    }
    console.log("profilePic: ", profilePic);
    if (!profilePic || !profilePic.url) {
        res
            .status(400)
            .json({
                message: "Profile picture not uploaded successfully"
            })
    }

    // step#3: delete old profile pic from cloudinary
    const prevPicture = req.user.profilePic;
    if (prevPicture && prevPicture !== "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg") {
        console.log("prevPicture: ", prevPicture);
        const deletePreviousPic = await deleteFromCloudinary(prevPicture);
        console.log("deletePreviousPic: ", deletePreviousPic);
        if (!deletePreviousPic) {
            console.log("previous pic cannot be deleted successfully");
        }
        else {
            console.log("previous pic deleted successfully");
        }
    }

    // step#4: update profilePic in User collection
    const user = await User.findByIdAndUpdate(req.user._id, { profilePic: profilePic.url }, { new: true }).select("-password -refreshToken");

    if (!user) {
        res
            .status(400)
            .json({
                message: "Something went wrong while updating profile picture"
            })
    }

    return res
        .status(200)
        .json(
            user
        )
});

const deleteProfilePic = asyncHandler(async (req, res) => {
    const prevPicture = req.user.profilePic;
    if (prevPicture) {
        const deletePreviousPic = await deleteFromCloudinary(prevPicture);
        console.log("deletePreviousPic: ", deletePreviousPic);
        if (!deletePreviousPic) {
            console.log("previous pic cannot be deleted successfully");
        }
        else {
            console.log("previous pic deleted successfully");
        }
    }
    const user = await User.findByIdAndUpdate(req.user._id, { profilePic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" }, { new: true }).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            user
        )
});

export {
    reqOTP,
    registerUser,
    loginUser,
    allUsers,
    updateProfilePic,
    deleteProfilePic,
    registerByGoogle,
    loginByGoogle
}