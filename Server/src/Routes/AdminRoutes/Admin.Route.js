import express from "express"
import { deleteUsers, fetchAllUsers } from "../../Controllers/AdminController.js";


const router = express.Router();

router.get("/users/get", fetchAllUsers);
router.delete("/users/delete/:id", deleteUsers)

export default router;