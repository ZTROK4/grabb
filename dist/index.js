"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes")); // we'll create this next
const app = (0, express_1.default)();
// Parse JSON
app.use(express_1.default.json());
// Enable CORS (adjust later for production)
app.use((0, cors_1.default)());
// --- Routes ---
app.use("/auth", auth_routes_1.default);
// Health test endpoint
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map