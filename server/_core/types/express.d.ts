import type { User } from "../../drizzle/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export {};