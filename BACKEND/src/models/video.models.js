import mongoose, {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
videofile: {
    type: String,// cloudinary url
    required: true,
    unique: true,
 
},
thumbnail:{
    type: String,
    required: true,
 
},
title:{
     type: String,
    required: true,
  
    
},
discription:{
    type: String,
   
    required: true,
},
duration:{
    type: String,// cloudinary url
    required: true,
},
owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
},
ispublished:{
    type: Boolean,
    default: true
},
views:{
    type: Number,
    default: 0
},

},{
timestamps:true
});

videoSchema.plugin(mongooseAggregatePaginate);


export const Video = mongoose.model("Video", videoSchema);  