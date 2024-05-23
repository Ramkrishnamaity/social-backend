// src/db.ts
import mongoose from "mongoose"

const ConnectDB = (): void => {
	const mongoURI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/mydatabase"
	mongoose.connect(mongoURI)
		.then(() => {
			console.log("MongoDB connected")
		})
		.catch((error) => {
			console.error("MongoDB connection error:", error)
		})
}

export default ConnectDB
