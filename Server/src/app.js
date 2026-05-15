import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./Routes/Auth.Routes/Auth.Routes.js";
import userRoutes from "./Routes/User.Routes/User.Routes.js";
import adminRoutes from "./Routes/AdminRoutes/Admin.Route.js"

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// COOKIE PARSER
app.use(cookieParser());

// BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/", userRoutes);
app.use("/api/admin", adminRoutes);

export default app;