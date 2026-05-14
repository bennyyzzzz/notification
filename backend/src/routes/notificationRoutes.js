import express from "express";
import { validatePush } from "../services/validationService.js";
import { sendFirebaseNotification } from "../services/firebaseService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    validatePush(req.body);

    const result = await sendFirebaseNotification(req.body);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;