import express from "express";
import cors from "cors";
import authRoutes from "./Routes/Auth.Routes/Auth.Routes.js";
import userRoutes from "./Routes/User.Routes/User.Routes.js";
import adminRoutes from "./Routes/AdminRoutes/Admin.Route.js"

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/", userRoutes);
app.use("/api/admin", adminRoutes);

export default app;