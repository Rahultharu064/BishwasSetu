import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  /* ------------------ CATEGORIES ------------------ */
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Home Repair" },
      update: {},
      create: {
        name: "Home Repair",
        icon: "🔧",
        description: "Plumbing, electrical, and general home repair services",
      },
    }),
    prisma.category.upsert({
      where: { name: "Cleaning" },
      update: {},
      create: {
        name: "Cleaning",
        icon: "🧹",
        description: "Professional house and deep cleaning services",
      },
    }),
    prisma.category.upsert({
      where: { name: "Home Improvement" },
      update: {},
      create: {
        name: "Home Improvement",
        icon: "🎨",
        description: "Painting, renovation, and home improvement services",
      },
    }),
    prisma.category.upsert({
      where: { name: "Moving" },
      update: {},
      create: {
        name: "Moving",
        icon: "🚚",
        description: "Professional moving and relocation services",
      },
    }),
    prisma.category.upsert({
      where: { name: "Security" },
      update: {},
      create: {
        name: "Security",
        icon: "🔒",
        description: "Home security installation and monitoring",
      },
    }),
    prisma.category.upsert({
      where: { name: "Home Maintenance" },
      update: {},
      create: {
        name: "Home Maintenance",
        icon: "🐜",
        description: "Pest control and regular home maintenance",
      },
    }),
    prisma.category.upsert({
      where: { name: "Outdoor" },
      update: {},
      create: {
        name: "Outdoor",
        icon: "🌿",
        description: "Gardening and outdoor maintenance services",
      },
    }),
  ]);

  console.log("✅ Categories seeded");

  /* ------------------ USERS ------------------ */
 

 

  /* ------------------ PROVIDERS ------------------ */
 

 

  /* ------------------ SERVICES ------------------ */
  

  

  console.log("🎉 Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

