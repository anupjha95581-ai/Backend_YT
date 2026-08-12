import asynchandler from '../utils/asynchaldler.js';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/apierrors.js';
import { User } from '../models/user.models.js';


 export const verifyJWT = asynchandler(async (req, res, next) => {
   try{
     const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    // Verify the token and attach user information to the request
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken._id).select("-password -refreshToken")

      if (!user) {
        throw new ApiError(404, "User not found");
      }
      req.user = user;
      next();
   }catch (error) {
    throw new ApiError(401, "Unauthorized: Invalid or expired token");
   }

})