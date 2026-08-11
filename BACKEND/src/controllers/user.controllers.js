import asynchandler from "../utils/asynchaldler.js";
import ApiError from "../utils/apierrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { apiresponse } from "../utils/apiresponce.js";  


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
 throw new ApiError("All fields are required", 400)
    }
     const existingUser = await User.findOne({
        $or:[{ email }, { username }]
     })
 if(existingUser){
    throw new ApiError("User already exists", 400);
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
        throw new ApiError("Avatar and cover image are required", 400);
    }

   const avatar = await uploadOnCloudinary(avatarlocalpath);
   const coverimage = await uploadOnCloudinary(coverlocalpath);
    if(!avatar || !coverimage){
        throw new ApiError("Image upload failed", 400);
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
        throw new ApiError("User creation failed", 500);
    }

    return res.status(201).json(new apiresponse(201, "User created successfully", createdUser));
})

export { registerUser };