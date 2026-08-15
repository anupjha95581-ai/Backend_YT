import mongoose, { isValidObjectId } from "mongoose"
import ApiError from "../utils/apierrors.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    const tweetsCollection = mongoose.connection.collection("tweets")
    const result = await tweetsCollection.insertOne({
        content,
        owner: new mongoose.Types.ObjectId(req.user?._id),
        createdAt: new Date(),
        updatedAt: new Date()
    })

    const tweet = await tweetsCollection.findOne({ _id: result.insertedId })
    return res.status(201).json(new ApiResponse(201, "Tweet created successfully", { tweet }))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const tweetsCollection = mongoose.connection.collection("tweets")
    const tweets = await tweetsCollection
        .find({ owner: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()

    return res.status(200).json(new ApiResponse(200, "User tweets fetched successfully", { tweets }))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    const tweetsCollection = mongoose.connection.collection("tweets")
    const tweet = await tweetsCollection.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(tweetId),
            owner: new mongoose.Types.ObjectId(req.user?._id)
        },
        {
            $set: {
                content,
                updatedAt: new Date()
            }
        },
        { returnDocument: "after" }
    )

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200, "Tweet updated successfully", { tweet }))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweetsCollection = mongoose.connection.collection("tweets")
    const deletedTweet = await tweetsCollection.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(tweetId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200, "Tweet deleted successfully", {}))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
