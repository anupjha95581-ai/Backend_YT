//  require("dotenv").config({path: "./.env"});
import dotenv from "dotenv";
dotenv.config({path: "./.env"});


 import experess from "express";
import connectDB from "./db/index.js";
  const app = express();

  connectDB()
  .then(() =>{
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })   
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  });


//   aprroach no 1
//   ( async () => {
//     try{
//       await mongoose.connect($`{process.env.MONGO_URI}/${DB_NAME}`, );
//       console.log("Connected to MongoDB");
//       app.on("error", (err) => {
//         console.error("Express app error:", err);
//       });

//       app.listen(process.env.PORT || 3000, () => {
//         console.log("Express app is listening on port $`{process.env.PORT || 3000}`");
//       })
//     } catch (error) {
//       console.error("Error connecting to MongoDB:", error);
//     }
//   })()

  






















































































































