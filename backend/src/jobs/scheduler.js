import cron from "node-cron";
import { prisma } from "../database/prisma.js";
import { sendFirebaseNotification } from "../services/firebaseService.js";

let isRunning = false;

export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const now = new Date();

      const scheduledNotifications = await prisma.notification.findMany({
        where: {
          status: "scheduled",
          scheduledAt: {
            lte: now
          }
        }
      });

      for (const notification of scheduledNotifications) {
        try {
          await prisma.notification.update({
            where: {
              id: notification.id
            },
            data: {
              status: "sending"
            }
          });

          await sendFirebaseNotification(notification);

          await prisma.notification.update({
            where: {
              id: notification.id
            },
            data: {
              status: "sent"
            }
          });

          console.log(`Notificação agendada enviada: ${notification.id}`);
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
            `Erro ao enviar notificação agendada ${notification.id}:`,
            error.response?.data || error.message
          );
        }
      }
    } catch (error) {
      console.error("Erro no scheduler:", error.message);
    } finally {
      isRunning = false;
    }
  });

  console.log("Scheduler iniciado.");
}