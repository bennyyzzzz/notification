import express from "express";
import { generatePushOptions } from "../services/aiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const options = await generatePushOptions(req.body);
    res.json(options);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao gerar notificações com IA",
      details: error.message
    });
  }
});

export default router;