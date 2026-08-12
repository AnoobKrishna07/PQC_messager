import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

await import("./server/_core/index.ts");