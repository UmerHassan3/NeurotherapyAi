import DbConnect from "../Server/src/DB/index.js";
import app from "../Server/src/app.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await DbConnect();
      isConnected = true;
    } catch (err) {
      console.error("❌ DB connection failed:", err.message);
      return res.status(500).json({ message: "Database connection failed: " + err.message });
    }
  }
  return app(req, res);
}
