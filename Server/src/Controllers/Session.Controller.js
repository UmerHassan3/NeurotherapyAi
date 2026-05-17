import ChatSession from "../Models/ChatSession.Model.js";
import ApiResponse from "../Utils/ApiResponse.js";

export const saveSession = async (req, res) => {
    try {
        const { messages, sessionType, summary } = req.body;
        const userId = req.userId;

        if (!messages || messages.length === 0) {
            return res.status(400).json(new ApiResponse(400, null, "No messages to save"));
        }

        const firstUserMsg = messages.find((m) => m.role === "user");
        const session = await ChatSession.create({
            userId,
            sessionType: sessionType || "meditation_chat",
            messages,
            summary: summary || firstUserMsg?.text?.slice(0, 100) || "Meditation chat session",
        });

        return res.status(201).json(new ApiResponse(201, session, "Session saved successfully"));
    } catch (error) {
        console.error("Save Session Error:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to save session"));
    }
};

export const getMySessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(20);
        return res.status(200).json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
    } catch (error) {
        console.error("Get Sessions Error:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to fetch sessions"));
    }
};
