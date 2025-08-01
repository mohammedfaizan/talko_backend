import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `MongoDB connected, DB Host: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    console.error("Mongodb connection error", error);
    process.exit(1);
  }
};

export default connectDB;
