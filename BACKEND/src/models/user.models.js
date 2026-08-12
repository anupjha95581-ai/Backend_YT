import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
username: {
    type: String,// cloudinary url
    required: true,
    unique: true,
    lowercase:true,
    index:true,
    trim:true
},
email:{
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    trim:true
},
fullname:{
     type: String,
    required: true,
  
    
    index:true,
    trim:true
},
avatar:{
    type: String,// cloudinary url
   
    required: true,
},
coverimage:{
    type: String,// cloudinary url
    required: true,
},
watchHistory:{
    type:[Schema.Types.ObjectId],
    ref:"video",
    default: []
},
password:{
    type: String,
    required: [true,' Passwod is Required'],
},
refreshToken:{
    type: String,
},
},{
timestamps:true
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    const payload = {
        _id: this._id,  
        email: this.email,
        username:this.username,
        fullname:this.fullname, 
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
};
userSchema.methods.generateRefreshToken = function(){
    const payload = {
        _id: this._id,
    };

    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
};

export const User = mongoose.model("User", userSchema);   