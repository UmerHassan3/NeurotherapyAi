import User from "../Models/Auth.Model.js";
import ApiResponse from "../Utils/ApiResponse.js";

export const fetchAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({});

        // check empty array properly
        if (allUsers.length === 0) {
            return res
                .status(404)
                .json(new ApiResponse(404, [], "No users found"));
        }

        return res.status(200).json(
            new ApiResponse(200, allUsers, "All Users Fetched Successfully")
        );

    } catch (error) {
        console.error("Fetch Users Error:", error);

        return res.status(500).json(
            new ApiResponse(500, null, "Internal Server Error")
        );
    }
};

export const deleteUsers = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json(
                new ApiResponse(400, null, "ID is required")
            );
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json(
                new ApiResponse(404, null, "User not found")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, deletedUser, "User deleted successfully")
        );

    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(500).json(
            new ApiResponse(500, null, "Cannot delete user")
        );
    }
};