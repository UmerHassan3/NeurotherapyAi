import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionType: { type: String, default: "meditation_chat" },
  messages: [MessageSchema],
  summary: { type: String },
}, { timestamps: true });

export default mongoose.model("ChatSession", ChatSessionSchema);
