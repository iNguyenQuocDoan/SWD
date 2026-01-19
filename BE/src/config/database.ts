import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (retries = MAX_RETRIES): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
  console.log("Database connected");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    
    if (retries > 0) {
      console.log(`Retrying connection... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    }
    
    console.error("\nFailed to connect to MongoDB after all retries.");
    console.error("Please ensure MongoDB is running or update MONGODB_URI in .env file");
    console.error("   - For local MongoDB: mongodb://localhost:27017/marketplace");
    console.error("   - For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname\n");
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err: Error) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

export default connectDB;
