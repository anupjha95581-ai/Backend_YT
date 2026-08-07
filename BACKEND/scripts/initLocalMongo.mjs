import mongoose from "mongoose";

const uri = "mongodb://127.0.0.1:27017/VIDEOTUBE";

async function init() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const existing = await db.listCollections({ name: "users" }).toArray();
    if (existing.length === 0) {
      await db.createCollection("users");
      console.log("Created collection: users");
    } else {
      console.log("Collection already exists: users");
    }

    console.log("Database ready: VIDEOTUBE");
  } catch (error) {
    console.error("Failed to initialize local MongoDB:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

init();
