import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  const connectionString = process.env.MONGODB_URI;
  if (!connectionString || connectionString.trim() === "") {
    throw new Error("MONGODB_URI is not set");
  }
  await mongoose.connect(connectionString);
}
