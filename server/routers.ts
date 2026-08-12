import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getMessagesBetweenUsers,
  insertMessage,
  getAllUsersWithStatus,
  getUserStatus,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  chat: router({
    // Get all users except the logged-in user
    getUsers: protectedProcedure.query(async ({ ctx }) => {
      const allUsers = await getAllUsersWithStatus();

      const otherUsers = allUsers.filter(
        (u) => u.id !== ctx.user?.id
      );

      return Promise.all(
        otherUsers.map(async (user) => {
          const status = await getUserStatus(user.id);

          return {
            ...user,
            isOnline: status?.isOnline ?? false,
            lastSeenAt: status?.lastSeenAt ?? user.lastSignedIn,
          };
        })
      );
    }),

    // Get conversation
    getMessages: protectedProcedure
      .input(
        z.object({
          otherUserId: z.number(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getMessagesBetweenUsers(
          ctx.user!.id,
          input.otherUserId
        );
      }),

    // Send message
    sendMessage: protectedProcedure
      .input(
        z.object({
          receiverId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return insertMessage({
          senderId: ctx.user!.id,
          receiverId: input.receiverId,
          content: input.content,
          isRead: false,
        });
      }),

    // User status
    getUserStatus: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
        })
      )
      .query(async ({ input }) => {
        return getUserStatus(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;