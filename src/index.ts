import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes"; // we'll create this next

const app = express();

// Parse JSON
app.use(express.json());

// Enable CORS (adjust later for production)
app.use(cors());

// --- Routes ---
app.use("/auth", authRoutes);

// Health test endpoint
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
