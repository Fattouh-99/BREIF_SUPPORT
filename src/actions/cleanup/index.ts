import { client } from "@/lib/prisma";
import { addDays, subDays } from "date-fns";

export async function cleanupOldChats() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  try {
    // First, delete all messages older than 30 days
    await client.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    // Then, delete chat rooms that are older than 30 days and have no messages
    await client.chatRoom.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        message: {
          none: {}
        }
      }
    });

    console.log("Successfully cleaned up old chats");
  } catch (error) {
    console.error("Error cleaning up old chats:", error);
  }
} 