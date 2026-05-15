import express from "express";
import { validatePush } from "../services/validationService.js";
import { sendFirebaseNotification } from "../services/firebaseService.js";
import { prisma } from "../database/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    validatePush(req.body);

    const result = await sendFirebaseNotification(req.body);

    if (req.body.id) {
      await prisma.notification.update({
        where: {
          id: Number(req.body.id)
        },
        data: {
          status: "sent"
        }
      });
    }

    res.json({
      success: true,
      message: "Notificação enviada com sucesso.",
      result
    });
  } catch (error) {
    console.error("Erro ao enviar push:", error.response?.data || error.message);

    if (req.body.id) {
      await prisma.notification.update({
        where: {
          id: Number(req.body.id)
        },
        data: {
          status: "failed"
        }
      });
    }

    res.status(400).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

export default router;