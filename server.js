const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorMiddleware/errorMiddleware");

// Routes
const registerRoutes = require("./routes/registerRoutes/registerRoutes");
const loginRoutes = require("./routes/loginRoutes/loginRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes/forgotPasswordRoutes");
const petRoutes = require("./routes/petRoutes/petRoutes");
const lostRoutes = require("./routes/lostRoutes/lostRoutes");
const scanRoutes = require("./routes/scanRoutes/scanRoutes");

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api/auth", registerRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/lost", lostRoutes);
app.use("/api/scan", scanRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});