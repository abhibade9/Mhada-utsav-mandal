import mongoose from "mongoose";

let isConnected = false;

export const isDatabaseConnected = () => isConnected;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mhada_utsav_db";
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    isConnected = true;
    return true;
  } catch (error) {
    console.warn(`[MongoDB] Local MongoDB is not reachable (${error.message}).`);
    console.log(`[Storage] Seamlessly activating high-performance local JSON storage fallback.`);
    // Disable command buffering so subsequent mongoose operations fail fast instead of hanging 10s
    mongoose.set("bufferCommands", false);
    isConnected = false;
    return false;
  }
};

export default connectDB;
