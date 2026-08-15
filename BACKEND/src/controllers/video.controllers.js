import mongoose, {isValidObjectId} from "mongoose"
import { Video } from "../models/video.models.js"
import ApiError from "../utils/apierrors.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNumber = Number(page) || 1
    const limitNumber = Number(limit) || 10
    const skip = (pageNumber - 1) * limitNumber

    const match = {}
    if (query) {
        match.title = { $regex: query, $options: "i" }
    }
    if (userId && isValidObjectId(userId)) {
        match.owner = new mongoose.Types.ObjectId(userId)
    }

    const sortField = sortBy || "createdAt"
    const sortOrder = sortType === "asc" ? 1 : -1

    const videos = await Video.find(match)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNumber)

    const total = await Video.countDocuments(match)

    return res.status(200).json(
        new ApiResponse(200, "Videos fetched successfully", {
            videos,
            page: pageNumber,
            limit: limitNumber,
            total
        })
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const uploadedFiles = Array.isArray(req.files) ? req.files : []
    const videoFile = uploadedFiles.find((file) => file.fieldname === "videoFile")
    const thumbnailFile = uploadedFiles.find((file) => file.fieldname === "thumbnail")

    const videoLocalPath = videoFile?.path
    const thumbnailLocalPath = thumbnailFile?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
        throw new ApiError(400, "File upload failed")
    }

    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description,
        duration: String(uploadedVideo.duration || "0"),
        owner: req.user?._id,
        isPublished: true
    })

    return res.status(201).json(new ApiResponse(201, "Video published successfully", { video }))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video fetched successfully", { video }))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const { title, description } = req.body
    const updateFields = {}

    if (title) updateFields.title = title
    if (description) updateFields.description = description

    const thumbnailLocalPath = req.file?.path
    if (thumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!uploadedThumbnail?.url) {
            throw new ApiError(400, "Thumbnail upload failed")
        }
        updateFields.thumbnail = uploadedThumbnail.url
    }

    const video = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user?._id },
        { $set: updateFields },
        { new: true }
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video updated successfully", { video }))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const deletedVideo = await Video.findOneAndDelete({ _id: videoId, owner: req.user?._id })
    if (!deletedVideo) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video deleted successfully", {}))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findOne({ _id: videoId, owner: req.user?._id })
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    await video.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, "Video publish status toggled successfully", { video })
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
