import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import userRoutes from "./routes/userRoutes.js";

connectDB();

const app = express();
app.use(express.json({ limit: "10mb" })); // Increase JSON payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Increase URL-encoded payload size

// Configure CORS
const corsOptions = {
  origin: ["http://localhost:5173", "https://roomrentel09.netlify.app"], // Allow specific origins
  methods: "GET,POST,PUT,DELETE,PATCH", // Allow specific HTTP methods
  credentials: true, // Allow cookies (if needed)
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve static files from uploads folder

// Routes
app.use("/api/users", userRoutes);

console.log("API routes are registered");

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
