import cron from "node-cron";
import { prisma } from "../database/prisma.js";
import { sendFirebaseNotification } from "../services/firebaseService.js";

let isRunning = false;

export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const now = new Date();

      console.log("[SCHEDULER] Verificando agendamentos...");
      console.log("[SCHEDULER] Agora:", now.toISOString());

      const scheduledNotifications = await prisma.notification.findMany({
        where: {
          status: "scheduled",
          scheduledAt: {
            lte: now
          }
        },
        orderBy: {
          scheduledAt: "asc"
        }
      });

      if (scheduledNotifications.length === 0) {
        console.log("[SCHEDULER] Nenhuma notificação pendente.");
      }

      for (const notification of scheduledNotifications) {
        console.log("[SCHEDULER] Encontrada:", {
          id: notification.id,
          title: notification.title,
          scheduledAt: notification.scheduledAt?.toISOString()
        });

        try {
          await prisma.notification.update({
            where: {
              id: notification.id
            },
            data: {
              status: "sending"
            }
          });

          await sendFirebaseNotification({
            ...notification,
            scheduledAt: notification.scheduledAt
              ? notification.scheduledAt.toISOString()
              : null
          });

          await prisma.notification.update({
            where: {
              id: notification.id
            },
            data: {
              status: "sent"
            }
          });

          console.log(
            `[SCHEDULER] Notificação agendada enviada: ${notification.id}`
          );
        } catch (error) {
          await prisma.notification.update({
            where: {
              id: notification.id
            },
            data: {
              status: "failed"
            }
          });

          console.error(
            `[SCHEDULER] Erro ao enviar notificação agendada ${notification.id}:`,
            error.response?.data || error.message
          );
        }
      }
    } catch (error) {
      console.error("[SCHEDULER] Erro geral:", error.message);
    } finally {
      isRunning = false;
    }
  });

  console.log("Scheduler iniciado.");
}