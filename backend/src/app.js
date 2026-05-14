import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import aiRoutes from "./routes/aiRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API do Gerador de Push Notification com IA funcionando"
  });
});

app.use("/generate-push-options", aiRoutes);
app.use("/queue", queueRoutes);
app.use("/send-notification", notificationRoutes);

export default app;