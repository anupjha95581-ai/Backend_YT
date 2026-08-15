import mongoose, {Schema} from "mongoose";


const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    // comment:{
    //     type: Schema.Types.ObjectId,
    //     ref: "Comment",
    //     required: true
    // },
    // tweet: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Tweet",
    //     required: true
    // },
    // likedBy: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true
    // },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })



export const Tweet = mongoose.model("Tweet", tweetSchema);
