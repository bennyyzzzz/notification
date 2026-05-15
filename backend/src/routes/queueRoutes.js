import express from "express";
import { prisma } from "../database/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const item = await prisma.notification.create({
      data: {
        campaignName: req.body.campaignName,
        title: req.body.title,
        body: req.body.body,
        redirectUrl: req.body.redirectUrl,
        audienceType: req.body.audienceType,
        audienceValue: req.body.audienceValue,
        status: req.body.status || "queued",
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
        firebaseIntegrationId: Number(req.body.firebaseIntegrationId)
      }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao adicionar item na fila.",
      details: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const queue = await prisma.notification.findMany({
      where: {
        status: {
          in: ["queued", "scheduled", "failed"]
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(queue);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar fila.",
      details: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await prisma.notification.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        ...req.body,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined
      }
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao atualizar item da fila.",
      details: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.notification.delete({
      where: {
        id: Number(req.params.id)
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao remover item da fila.",
      details: error.message
    });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const item = await prisma.notification.findUnique({
      where: {
        id: Number(req.params.id)
      }
    });

    if (!item) {
      return res.status(404).json({
        error: "Item não encontrado."
      });
    }

    const duplicated = await prisma.notification.create({
      data: {
        campaignName: item.campaignName,
        title: item.title,
        body: item.body,
        redirectUrl: item.redirectUrl,
        audienceType: item.audienceType,
        audienceValue: item.audienceValue,
        status: "queued",
        scheduledAt: null,
        firebaseIntegrationId: item.firebaseIntegrationId
      }
    });

    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao duplicar item.",
      details: error.message
    });
  }
});

router.post("/:id/schedule", async (req, res) => {
  try {
    if (!req.body.scheduledAt) {
      return res.status(400).json({
        error: "Data e horário do agendamento são obrigatórios."
      });
    }

    const item = await prisma.notification.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        status: "scheduled",
        scheduledAt: new Date(req.body.scheduledAt)
      }
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao agendar notificação.",
      details: error.message
    });
  }
});

export default router;