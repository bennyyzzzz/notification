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
      message: "Notificação enviada com sucesso.",
      firebaseResult: result
    });
  } catch (error) {
    console.error("Erro ao enviar push:", error.response?.data || error.message);

    res.status(400).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

export default router;