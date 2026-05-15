import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { prisma } from "../database/prisma.js";
import { decrypt } from "../utils/crypto.js";
import { buildTrackedUrl } from "../utils/urlBuilder.js";

async function getFirebaseConfig(firebaseIntegrationId) {
  if (!firebaseIntegrationId) {
    throw new Error("Integração Firebase é obrigatória.");
  }

  const integration = await prisma.firebaseIntegration.findFirst({
    where: {
      id: Number(firebaseIntegrationId),
      active: true
    }
  });

  if (!integration) {
    throw new Error("Integração Firebase não encontrada.");
  }

  return {
    projectId: integration.projectId,
    clientEmail: integration.clientEmail,
    privateKey: decrypt(integration.encryptedPrivateKey)
  };
}

async function getAccessToken(firebaseConfig) {
  const auth = new GoogleAuth({
    credentials: {
      client_email: firebaseConfig.clientEmail.trim(),
      private_key: firebaseConfig.privateKey
        .replace(/\\n/g, "\n")
        .replace(/^"|"$/g, "")
        .trim()
    },
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"]
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  return accessToken.token;
}

async function sendSingleMessage(data) {
  const {
    title,
    body,
    redirectUrl,
    audienceType,
    audienceValue,
    campaignName,
    firebaseIntegrationId
  } = data;

  const firebaseConfig = await getFirebaseConfig(firebaseIntegrationId);
  const accessToken = await getAccessToken(firebaseConfig);

  const trackedUrl = buildTrackedUrl(redirectUrl, campaignName);

  const message = {
    notification: {
      title,
      body
    },
    data: {
      redirect_url: trackedUrl
    }
  };

  if (audienceType === "token") {
    message.token = audienceValue;
  }

  if (audienceType === "topic") {
    message.topic = audienceValue;
  }

  if (audienceType === "condition") {
    message.condition = audienceValue;
  }

  const response = await axios.post(
    `https://fcm.googleapis.com/v1/projects/${firebaseConfig.projectId}/messages:send`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return {
    firebaseResponse: response.data,
    trackedUrl
  };
}

export async function sendFirebaseNotification(data) {
  if (data.audienceType === "token_list") {
    const tokens = data.audienceValue
      .split(/[\n,]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      throw new Error("Lista de tokens vazia.");
    }

    const results = [];

    for (const token of tokens) {
      try {
        const result = await sendSingleMessage({
          ...data,
          audienceType: "token",
          audienceValue: token
        });

        results.push({
          token,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          token,
          success: false,
          error: error.response?.data || error.message
        });
      }
    }

    return {
      total: tokens.length,
      success: results.filter((item) => item.success).length,
      failed: results.filter((item) => !item.success).length,
      results
    };
  }

  return sendSingleMessage(data);
}