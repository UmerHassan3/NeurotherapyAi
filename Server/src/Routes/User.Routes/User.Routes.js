import express from 'express';
import { fetchUser, updateUser } from '../../Controllers/User.Controller.js';

const router = express.Router();

router.get("/get", fetchUser);
router.put("/update/:userId", updateUser);


export default router;