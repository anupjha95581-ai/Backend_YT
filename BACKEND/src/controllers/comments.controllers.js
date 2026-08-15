import mongoose from "mongoose"
import { Comment } from "../models/comments.models.js"
import ApiError from "../utils/apierrors.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const pageNumber = Number(page) || 1
    const limitNumber = Number(limit) || 10
    const skip = (pageNumber - 1) * limitNumber

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)

    const total = await Comment.countDocuments({ video: videoId })

    return res.status(200).json(
        new ApiResponse(200, "Video comments fetched successfully", {
            comments,
            page: pageNumber,
            limit: limitNumber,
            total
        })
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    return res.status(201).json(
        new ApiResponse(201, "Comment added successfully", { comment })
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user?._id },
        { $set: { content } },
        { new: true }
    )

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    return res.status(200).json(
        new ApiResponse(200, "Comment updated successfully", { comment })
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id
    })

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found")
    }

    return res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully", {})
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
