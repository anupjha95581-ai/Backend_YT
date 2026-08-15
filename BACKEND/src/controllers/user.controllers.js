import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apierrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/apiresponse.js";  
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
 

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


const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation of user details:USERNAME OR EMAIL
    // check if user already exists
    //check for images, check for avatar
    //upload them to cloudinary
    //create user object and create entry in db
    //remove password and refresh token from user object and send response to frontend
    //check for user creation
    // return response
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

const avatarLocalPath = avatarFile?.path;
const coverLocalPath = coverFile?.path;


    if(!avatarLocalPath || !coverLocalPath){
        throw new ApiError(400, "Avatar and cover image are required");
    }
   
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverLocalPath);
    if(!avatar || !coverImage){
        throw new ApiError(400, "Image upload failed");
    } 
   const user = await User.create({
        username: username.toLowerCase(),
        email,  
        password,
       fullName,
        avatar: avatar.url,
        coverImage: coverImage.url,
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "User creation failed");
    }

    return res.status(201).json(new ApiResponse(201, "User created successfully", createdUser));
})


 const loginUser = asyncHandler(async (req, res) => {
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
 
 
 const logoutUser = asyncHandler(async (req, res) => {
    
   await User.findByIdAndUpdate(
    req.user._id,{
        $unset: {refreshToken: 1 }//this removes the field from the  document , or set{refreshToken: null} to set it to null or undefined
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

 const refreshAccessToken = asyncHandler(async (req,res) =>{
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
    throw new ApiError(401,"invalid refresh token")
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
    throw new ApiError(400,error?.message || "invalid refresh token")
}
 })

  const changeCurrentPassword = asyncHandler(async (req,res) =>{
    const {currentPassword,newPassword} = req.body  
const user = await User.findById(req.user._id)
const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
if(!isPasswordCorrect){
    throw new ApiError(400,"current password is incorrect")
}
user.password = newPassword
await user.save({validateBeforeSave: false})

return res.status(200)
.json(new ApiResponse(200,"password changed successfully",{}))
  })

  const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,"current user fetched successfully",{user: req.user}))
  })

  const updateAccountDetails = asyncHandler(async(req,res)=>{
    const{fullName,email} = req.body
     if(!fullName || !email){
        throw new ApiError(400,"fullName and email is required")
     }

     User.findByIdAndUpdate(req.user._id,
        {
         $set:{
            fullName,
            email: email
         }   
        },
    {new: true}
    ).select("-password -refreshToken")

    return res.status(200)
    .json(new ApiResponse(200,user,"Account Details updated successfully"))
  })


const updateUserAvatar = asyncHandler(async(req,res)=>{
     const avatarLocalPath = req.file?.path
     if(!avatarLocalPath){
        throw new ApiError(400,"avatar image is required")
     }

      const avatar = await uploadOnCloudinary(avatarLocalPath)

      if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar")
      }

     const user = await User.findByIdAndUpdate(req.user._id,
     {
$set: {
            avatar: avatar.url     
}
     },
     {new: true}
).select("-password")
 return res.status(200).json(new ApiResponse(200,"Avatar updated successfully",{user}))
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
     const coverImageLocalPath = req.file?.path
     if(!coverImageLocalPath){
        throw new ApiError(400,"cover image is required")
     }

      const coverImage = await uploadOnCloudinary(coverImageLocalPath)

      if(!coverImage.url){
        throw new ApiError(400,"Error while uploading cover image")
      }

     const user = await User.findByIdAndUpdate(req.user._id,
     {
$set: {
            coverImage: coverImage.url     
}
     },
     {new: true}
).select("-password")

return res.status(200).json(new ApiResponse(200,"Cover image updated successfully",{user}))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
const {username} = req.params
if(!username?.trim()){
    throw new ApiError(400,"username is required")}

   const channel = await User.aggregate([
    {
        $match:{
            username: username?.toLowerCase()
        },
    },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedChannels"
            }
        },
        {
            $addFields:{
                subscribersCount: {$size: "$subscribers"},
                subscribedChannelsCount: {$size: "$subscribedChannels"},
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },

    {
        $project: {
            fullName: 1,
            username: 1,
            email: 1,
            avatar: 1,
            coverImage: 1,
            subscribersCount: 1,
            subscribedChannelsCount: 1,
            isSubscribed: 1
        }

    }
    
   ])
   console.log("Channel profile fetched:", channel);
   if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  return res.status(200)
  .json(new ApiResponse(200,"Channel profile fetched successfully",{channel: channel[0]}))
})

const getUserWatchHistory = asyncHandler(async(req,res)=>{
const user = await User.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)//mongoose don't work here, so we don't get the user id from req.user._id, we get string id from req.user._id and convert it to object id using mongoose.Types.ObjectId, we use difrent approach

        }
    },
    {
        $lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchedHistory",
            pipeline:[
                {
                    $lookup:{
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline:[
                            {//subpipeline to get only required fields from owner, we don't need all the fields from owner, we need only fullName, username and avatar
                                $project:{
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            },
                            {
                                $addFields:{
                                    owner:{
                                        $first:"$owner"
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }

])
    return res
    .status(200).json(new ApiResponse(200,"User watch history fetched successfully",{watchHistory: user[0]?.watchedHistory || []}))
})


export { registerUser,
    loginUser,
    logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getUserWatchHistory
 };
