import mongoose, {Schema} from "mongoose";




const playtlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    videos: [
        {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }
],
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    timestamps: true
})



export const playlistSchema = mongoose.model("Playlist", playlistSchema);