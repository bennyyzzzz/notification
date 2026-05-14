import axios from "axios";
import { GoogleAuth } from "google-auth-library";

export async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"]
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  return accessToken.token;
}

export async function sendFirebaseNotification(data) {
  const {
    title,
    body,
    redirectUrl,
    audienceType,
    audienceValue
  } = data;

  const accessToken = await getAccessToken();

  const projectId = process.env.FIREBASE_PROJECT_ID;

  const message = {
    notification: {
      title,
      body
    },
    data: {
      redirect_url: redirectUrl
    }
  };

  if (audienceType === "token") {
    message.token = audienceValue;
  }

  if (audienceType === "topic") {
    message.topic = audienceValue;
  }

  const payload = {
    message
  };

  const response = await axios.post(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}