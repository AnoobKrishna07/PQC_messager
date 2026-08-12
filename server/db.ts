import { eq, and, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, messages, userStatus, Message, UserStatus, InsertMessage, InsertUserStatus } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all messages between two users, ordered by creation time.
 */
export async function getMessagesBetweenUsers(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get messages:", error);
    throw error;
  }
}

/**
 * Insert a new message.
 */
export async function insertMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert message: database not available");
    return null;
  }

  try {
    const result = await db.insert(messages).values(message);
    return result;
  } catch (error) {
    console.error("[Database] Failed to insert message:", error);
    throw error;
  }
}

/**
 * Get user status by user ID.
 */
export async function getUserStatus(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user status: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(userStatus)
      .where(eq(userStatus.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user status:", error);
    throw error;
  }
}

/**
 * Update or insert user status.
 */
export async function upsertUserStatus(userId: number, isOnline: boolean) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user status: database not available");
    return null;
  }

  try {
    const result = await db
      .insert(userStatus)
      .values({
        userId,
        isOnline,
        lastSeenAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          isOnline,
          lastSeenAt: new Date(),
        },
      });

    return result;
  } catch (error) {
    console.error("[Database] Failed to upsert user status:", error);
    throw error;
  }
}

/**
 * Get all users with their online status.
 */
export async function getAllUsersWithStatus() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
