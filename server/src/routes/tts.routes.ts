import { Router } from "express";
import { ttsController } from "../features/tts/tts.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router: Router = Router();

// Protect the TTS route to prevent unauthenticated access and potential abuse.
router.post("/generate", verifyToken, ttsController.generateSpeech);
router.get("/me/quota", verifyToken, ttsController.getUserQuota);

export default router;
