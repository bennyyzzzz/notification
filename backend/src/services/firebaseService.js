import axios from "axios";
import { GoogleAuth } from "google-auth-library";

function validateFirebaseConfig(firebaseConfig) {
  if (!firebaseConfig?.projectId) {
    throw new Error("Project ID do Firebase é obrigatório.");
  }

  if (!firebaseConfig?.clientEmail) {
    throw new Error("Client Email do Firebase é obrigatório.");
  }

  if (!firebaseConfig?.privateKey) {
    throw new Error("Private Key do Firebase é obrigatória.");
  }
}

async function getAccessToken(firebaseConfig) {
  validateFirebaseConfig(firebaseConfig);

  const auth = new GoogleAuth({
    credentials: {
      client_email: firebaseConfig.clientEmail,
      private_key: firebaseConfig.privateKey.replace(/\\n/g, "\n")
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
    firebaseConfig
  } = data;

  const accessToken = await getAccessToken(firebaseConfig);

  const message = {
    notification: {
      title,
      body
    },
    data: {
      redirect_url: redirectUrl || ""
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
    {
      message
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}

export async function sendFirebaseNotification(data) {
  if (data.audienceType === "token_list") {
    const tokens = data.audienceValue
      .split(/[\n,]+/)
      .map((token) => token.trim())
      .filter(Boolean);

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