import express from 'express';
import { addContact } from '../../Controllers/User.Controller.js';

const router = express.Router();

router.post("/contact/add",addContact)


export default router;