import asynchandler from "../utils/asynchaldler.js";
import ApiError from "../utils/apierrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/apiresponse.js";  
import jwt from "jsonwebtoken"

const generateTokens = async(userID) => {
    try{
const user = await User.findById(userID);
if (!user) {
    throw new ApiError(404, "User not found");
}
const accessToken = user.generateAccessToken();
const refreshToken = user.generateRefreshToken();
user.refreshToken = refreshToken;
 await user.save({validateBeforeSave:false});
 return { accessToken, refreshToken };
    }catch(error){
throw new ApiError(500, "Token generation failed");
    }
}


const registerUser = asynchandler(async (req, res) => {
    //get user details from frontend
    //validation of user details:USERBNAME OR EMAIL
    // check if user already exists
    //check for images, check for avatar
    //upload them to cloudinary
    //create user object and create entry in db
    //remove passworfd and refresh token from user object and send response to frontend
    //check for user creation
    // return responce
     const { username, email, password, fullName } = req.body;
    console.log("User details received:", { username, email, password, fullName });

    // if(fullName == ""){
    //     throw new ApiError("Full name is required", 400);
    // }

    if(
        [fullName,email,password,username].some((field) => !field || field.trim() === "")
    ){
 throw new ApiError(400, "All fields are required")
    }
     const existingUser = await User.findOne({
        $or:[{ email }, { username }]
     })
 if(existingUser){
     throw new ApiError(400, "User already exists");
 }

//  console.log("Files received:", req.files);

const uploadedFiles = Array.isArray(req.files) ? req.files : [];
const avatarFile = uploadedFiles.find((file) =>
    ["avatar", "avatarImage", "avatarimage"].includes(file.fieldname)
);
const coverFile = uploadedFiles.find((file) =>
    ["cover", "coverImage", "coverimage"].includes(file.fieldname)
);

const avatarlocalpath = avatarFile?.path;
const coverlocalpath = coverFile?.path;


    if(!avatarlocalpath || !coverlocalpath){
        throw new ApiError(400, "Avatar and cover image are required");
    }
   
   const avatar = await uploadOnCloudinary(avatarlocalpath);
   const coverimage = await uploadOnCloudinary(coverlocalpath);
    if(!avatar || !coverimage){
        throw new ApiError(400, "Image upload failed");
    } 
   const user = await User.create({
        username: username.toLowerCase(),
        email,  
        password,
       fullname: fullName,
        avatar: avatar.url,
        coverimage: coverimage.url,
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "User creation failed");
    }

    return res.status(201).json(new ApiResponse(201, "User created successfully", createdUser));
})


 const loginUser = asynchandler(async (req, res) => {
 // req boy-data
 //username or email
 // find the user
 //password check
 //access and refresh tokens
 //send secure cookies

 const {email, password, username} = req.body
 if (!username && !email) {
throw new ApiError(400, "Username or email is required");
 }
 const user = await User.findOne({
    $or: [{ email }, { username }]
 })
  if (!user) {
     throw new ApiError(404, "User does not exist");
 }
 const isPasswordValid = await user.isPasswordCorrect(password);
 if (!isPasswordValid) {
     throw new ApiError(401, "Invalid credentials");
 }

 const { accessToken, refreshToken } = await generateTokens(user._id);
 
const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

const options = {
    httpOnly: true,
    secure:true,
}

return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, "Login successful", { user: loggedInUser, accessToken, refreshToken }));

 });
 
 
 const logoutUser = asynchandler(async (req, res) => {
    
   await User.findByIdAndUpdate(
    req.user._id,{
        $set: {refreshToken: undefined}
    },
    {
        new: true,
    }
  )
const options = {
        httpOnly: true,
        secure: true
    };
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "Logout successful", {}));
 });

 const refreshAccessToken = asynchandler(async (req,res) =>{
 const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
}

 const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
)
 const user = await User.findById(decodedToken?._id)
 if(!user){
    throw new ApiError(401,"ivalid refresh token")
}
if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"refresh token is expired or used")
}
try {
    
    const options = {
        httpOnly: true,
        secure: true
    }
     const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id)
    
      return res.status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
        new ApiResponse(
            200,
            "accessToken refreshed",
            {accessToken,refreshToken: newRefreshToken}
        )
      )
} catch (error) {
    throw new ApiError(400,error?.message || "invalid refres token")
}
 })


export { registerUser,
    loginUser,
    logoutUser,
   refreshAccessToken
 };
