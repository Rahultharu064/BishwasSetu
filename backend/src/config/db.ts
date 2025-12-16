import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Instantiate Prisma Client
const prismaClient = new PrismaClient({
  log: ["error"],
});

export default prismaClient;
