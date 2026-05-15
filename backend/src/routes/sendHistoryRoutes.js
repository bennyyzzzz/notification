import express from "express";
import { prisma } from "../database/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const history = await prisma.sendHistory.findMany({
      orderBy: {
        sentAt: "desc"
      }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar histórico.",
      details: error.message
    });
  }
});

export default router;