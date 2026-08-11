import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
 const connectioninstance = await mongoose.connect(process.env.MONGODB_URI);
     console.log(`\n MongoDB connected : ${connectioninstance.connection.host}`);
     
    }catch(error){
      console.log("Error connecting to MongoDB:", error);
      process.exit(1); // Exit the process with an error code 
    }
}

export default connectDB;
