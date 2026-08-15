import mongoose, {isValidObjectId} from "mongoose"
import ApiError from "../utils/apierrors.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlistsCollection = mongoose.connection.collection("playlists")
    const result = await playlistsCollection.insertOne({
        name,
        description,
        owner: new mongoose.Types.ObjectId(req.user?._id),
        videos: [],
        createdAt: new Date(),
        updatedAt: new Date()
    })

    const playlist = await playlistsCollection.findOne({ _id: result.insertedId })
    return res.status(201).json(new ApiResponse(201, "Playlist created successfully", { playlist }))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const playlistsCollection = mongoose.connection.collection("playlists")
    const playlists = await playlistsCollection
        .find({ owner: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()

    return res.status(200).json(new ApiResponse(200, "User playlists fetched successfully", { playlists }))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlistsCollection = mongoose.connection.collection("playlists")
    const playlist = await playlistsCollection.findOne({ _id: new mongoose.Types.ObjectId(playlistId) })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, "Playlist fetched successfully", { playlist }))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id")
    }

    const playlistsCollection = mongoose.connection.collection("playlists")
    const playlist = await playlistsCollection.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(playlistId),
            owner: new mongoose.Types.ObjectId(req.user?._id)
        },
        {
            $addToSet: { videos: new mongoose.Types.ObjectId(videoId) },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: "after" }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", { playlist }))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id")
    }

    const playlistsCollection = mongoose.connection.collection("playlists")
    const playlist = await playlistsCollection.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(playlistId),
            owner: new mongoose.Types.ObjectId(req.user?._id)
        },
        {
            $pull: { videos: new mongoose.Types.ObjectId(videoId) },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: "after" }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", { playlist }))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlistsCollection = mongoose.connection.collection("playlists")
    const deletedPlaylist = await playlistsCollection.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(playlistId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, "Playlist deleted successfully", {}))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    if (!name && !description) {
        throw new ApiError(400, "At least one field is required")
    }

    const updateFields = {}
    if (name) updateFields.name = name
    if (description) updateFields.description = description
    updateFields.updatedAt = new Date()

    const playlistsCollection = mongoose.connection.collection("playlists")
    const playlist = await playlistsCollection.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(playlistId),
            owner: new mongoose.Types.ObjectId(req.user?._id)
        },
        { $set: updateFields },
        { returnDocument: "after" }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, "Playlist updated successfully", { playlist }))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
