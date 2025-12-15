import { PrismaClient } from "@prisma/client";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
import { connect } from "@planetscale/database";

// create a connection
const connection = connect({ url: process.env.DATABASE_URL });

// Instantiate Prisma Client with adapter
const prismaClient = new PrismaClient({
  adapter: new PrismaPlanetScale(connection),
  log: ["query", "info", "warn", "error"],
});

export default prismaClient;
