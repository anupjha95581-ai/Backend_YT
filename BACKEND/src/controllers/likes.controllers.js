import mongoose, {isValidObjectId} from "mongoose"
import ApiError from "../utils/apierrors.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const likesCollection = mongoose.connection.collection("likes")
    const existingLike = await likesCollection.findOne({
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        video: new mongoose.Types.ObjectId(videoId)
    })

    if (existingLike) {
        await likesCollection.deleteOne({ _id: existingLike._id })
        return res.status(200).json(new ApiResponse(200, "Video unliked successfully", {}))
    }

    await likesCollection.insertOne({
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        owner: new mongoose.Types.ObjectId(req.user?._id),
        video: new mongoose.Types.ObjectId(videoId),
        createdAt: new Date(),
        updatedAt: new Date()
    })

    return res.status(200).json(new ApiResponse(200, "Video liked successfully", {}))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const likesCollection = mongoose.connection.collection("likes")
    const existingLike = await likesCollection.findOne({
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        comment: new mongoose.Types.ObjectId(commentId)
    })

    if (existingLike) {
        await likesCollection.deleteOne({ _id: existingLike._id })
        return res.status(200).json(new ApiResponse(200, "Comment unliked successfully", {}))
    }

    await likesCollection.insertOne({
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        owner: new mongoose.Types.ObjectId(req.user?._id),
        comment: new mongoose.Types.ObjectId(commentId),
        createdAt: new Date(),
        updatedAt: new Date()
    })

    return res.status(200).json(new ApiResponse(200, "Comment liked successfully", {}))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const likesCollection = mongoose.connection.collection("likes")
    const existingLike = await likesCollection.findOne({
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        tweet: new mongoose.Types.ObjectId(tweetId)
    })

    if (existingLike) {
        await likesCollection.deleteOne({ _id: existingLike._id })
        return res.status(200).json(new ApiResponse(200, "Tweet unliked successfully", {}))
    }

    await likesCollection.insertOne({
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        owner: new mongoose.Types.ObjectId(req.user?._id),
        tweet: new mongoose.Types.ObjectId(tweetId),
        createdAt: new Date(),
        updatedAt: new Date()
    })

    return res.status(200).json(new ApiResponse(200, "Tweet liked successfully", {}))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likesCollection = mongoose.connection.collection("likes")
    const likedVideos = await likesCollection
        .find({
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
            video: { $exists: true, $ne: null }
        })
        .sort({ createdAt: -1 })
        .toArray()

    return res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", { likedVideos }))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
