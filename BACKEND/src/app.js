import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(cookieParser());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({extended: true }));
app.use(express.static("public"));

//routes import
import userRoutes from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comments.routes.js"
import likeRouter from "./routes/likes.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
// routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
// app.use((err, req, res, next) => {
// 	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
// 		return res.status(400).json({
// 			success: false,
// 			message: "Invalid JSON body. Use double quotes around property names and string values.",
// 		});
// 	}

// 	return res.status(err.statusCode || 500).json({
// 		success: false,
// 		message: err.message || "Internal Server Error",
// 	});
// });

export default app;
