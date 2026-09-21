import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection error: ${error.message}`);
    // In production or local development without local MongoDB active,
    // logging the warning allows the server to still start or provide clear diagnostic.
  }
};
