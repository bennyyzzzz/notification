import express from "express";
import { prisma } from "../database/prisma.js";
import { encrypt } from "../utils/crypto.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { appId, name, projectId, clientEmail, privateKey } = req.body;

    if (!appId) {
      return res.status(400).json({ error: "App é obrigatório." });
    }

    if (!name) {
      return res.status(400).json({ error: "Nome da integração é obrigatório." });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Project ID é obrigatório." });
    }

    if (!clientEmail) {
      return res.status(400).json({ error: "Client Email é obrigatório." });
    }

    if (!privateKey) {
      return res.status(400).json({ error: "Private Key é obrigatória." });
    }

    const integration = await prisma.firebaseIntegration.create({
      data: {
        appId: Number(appId),
        name,
        projectId,
        clientEmail,
        encryptedPrivateKey: encrypt(privateKey),
        active: true
      },
      select: {
        id: true,
        appId: true,
        name: true,
        projectId: true,
        clientEmail: true,
        active: true,
        createdAt: true
      }
    });

    res.status(201).json(integration);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao criar integração Firebase.",
      details: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const integrations = await prisma.firebaseIntegration.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        appId: true,
        name: true,
        projectId: true,
        clientEmail: true,
        active: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(integrations);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar integrações Firebase.",
      details: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.firebaseIntegration.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        active: false
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao remover integração Firebase.",
      details: error.message
    });
  }
});

export default router;