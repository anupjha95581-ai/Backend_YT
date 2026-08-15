import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import ApiError from "../utils/apierrors.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user?._id
    if (!channelId) {
        throw new ApiError(401, "Unauthorized request")
    }

    const totalVideos = await Video.countDocuments({ owner: channelId })

    const totalViewsData = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ])

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId })

    const likesCollection = mongoose.connection.collection("likes")
    const totalLikes = await likesCollection.countDocuments({
        video: { $in: (await Video.find({ owner: channelId }).select("_id")).map((video) => video._id) },
    })

    return res.status(200).json(
        new ApiResponse(200, "Channel stats fetched successfully", {
            totalVideos,
            totalViews: totalViewsData[0]?.totalViews || 0,
            totalSubscribers,
            totalLikes,
        })
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id
    if (!channelId) {
        throw new ApiError(401, "Unauthorized request")
    }

    const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 })
    return res.status(200).json(new ApiResponse(200, "Channel videos fetched successfully", { videos }))
})

export {
    getChannelStats,
    getChannelVideos
}
