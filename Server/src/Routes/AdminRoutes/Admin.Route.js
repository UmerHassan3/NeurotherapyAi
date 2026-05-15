import express from "express"
import { deleteContact, deleteUsers, fetchAllUsers, getContact, sendReply } from "../../Controllers/AdminController.js";


const router = express.Router();

router.get("/users/get", fetchAllUsers);
router.delete("/users/delete/:id", deleteUsers);
router.get("/users/contact/get", getContact);
router.delete("/users/contact/delete/:id", deleteContact);
router.post("/users/contact/reply",sendReply)

export default router;