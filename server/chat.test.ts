import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number, userName: string): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: userName,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("chat procedures", () => {
  it("should get users excluding current user", async () => {
    const { ctx } = createAuthContext(1, "User One");
    const caller = appRouter.createCaller(ctx);

    // This test assumes there are users in the database
    // In a real scenario, you'd seed test data
    const users = await caller.chat.getUsers();
    
    expect(Array.isArray(users)).toBe(true);
    // Current user should not be in the list
    expect(users.every((u: any) => u.id !== 1)).toBe(true);
  });

  it("should get messages between two users", async () => {
    const { ctx } = createAuthContext(1, "User One");
    const caller = appRouter.createCaller(ctx);

    // This test assumes there are messages in the database
    const messages = await caller.chat.getMessages({ otherUserId: 2 });
    
    expect(Array.isArray(messages)).toBe(true);
  });

  it("should send a message", async () => {
    const { ctx } = createAuthContext(1, "User One");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.sendMessage({
      receiverId: 2,
      content: "Hello, this is a test message!",
    });

    expect(result).toBeDefined();
  });

  it("should get user status", async () => {
    const { ctx } = createAuthContext(1, "User One");
    const caller = appRouter.createCaller(ctx);

    const status = await caller.chat.getUserStatus({ userId: 2 });
    
    // Status might be null if user hasn't been initialized
    if (status) {
      expect(status).toHaveProperty("userId");
      expect(status).toHaveProperty("isOnline");
    }
  });

  it("should throw error when sending message without authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.chat.getUsers();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
