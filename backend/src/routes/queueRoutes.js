import express from "express";
import { prisma } from "../database/prisma.js";

const router = express.Router();

function normalizeScheduledAt(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getStatusFromRequest(body) {
  if (body.status === "scheduled") {
    return "scheduled";
  }

  if (body.sendMode === "scheduled") {
    return "scheduled";
  }

  return "queued";
}

router.post("/", async (req, res) => {
  try {
    const status = getStatusFromRequest(req.body);
    const scheduledAt = normalizeScheduledAt(req.body.scheduledAt);

    if (status === "scheduled" && !scheduledAt) {
      return res.status(400).json({
        error: "Data e horário do agendamento são obrigatórios."
      });
    }

    const item = await prisma.notification.create({
      data: {
        campaignName: req.body.campaignName,
        title: req.body.title,
        body: req.body.body,
        redirectUrl: req.body.redirectUrl,
        audienceType: req.body.audienceType,
        audienceValue: req.body.audienceValue,
        firebaseIntegrationId: Number(req.body.firebaseIntegrationId),
        status,
        scheduledAt
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
    const data = {
      ...req.body
    };

    if (req.body.scheduledAt !== undefined) {
      data.scheduledAt = normalizeScheduledAt(req.body.scheduledAt);
    }

    if (req.body.firebaseIntegrationId !== undefined) {
      data.firebaseIntegrationId = Number(req.body.firebaseIntegrationId);
    }

    const item = await prisma.notification.update({
      where: {
        id: Number(req.params.id)
      },
      data
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

    res.json({
      success: true
    });
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
        firebaseIntegrationId: item.firebaseIntegrationId,
        status: item.status === "scheduled" ? "scheduled" : "queued",
        scheduledAt: item.scheduledAt
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

export default router;