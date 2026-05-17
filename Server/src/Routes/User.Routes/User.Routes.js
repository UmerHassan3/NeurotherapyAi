import express from 'express';
import { addContact } from '../../Controllers/User.Controller.js';
import { saveSession, getMySessions } from '../../Controllers/Session.Controller.js';
import AuthMiddleware from '../../Middleware/Auth.Middleware.js';

const router = express.Router();

router.post("/contact/add", addContact);
router.post("/session/save", AuthMiddleware, saveSession);
router.get("/session/my", AuthMiddleware, getMySessions);

export default router;
