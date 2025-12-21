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
  const user1 = await prisma.user.upsert({
    where: { email: "provider1@test.com" },
    update: {},
    create: {
      name: "Ram Bahadur Shrestha",
      email: "provider1@test.com",
      password: "hashed_password_here",
      role: "PROVIDER",
      phone: "9841234567",
      address: "Kathmandu",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "provider2@test.com" },
    update: {},
    create: {
      name: "Sita Devi Sharma",
      email: "provider2@test.com",
      password: "hashed_password_here",
      role: "PROVIDER",
      phone: "9841234568",
      address: "Lalitpur",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "provider3@test.com" },
    update: {},
    create: {
      name: "Krishna Prasad Adhikari",
      email: "provider3@test.com",
      password: "hashed_password_here",
      role: "PROVIDER",
      phone: "9841234569",
      address: "Bhaktapur",
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: "provider4@test.com" },
    update: {},
    create: {
      name: "Maya Gurung",
      email: "provider4@test.com",
      password: "hashed_password_here",
      role: "PROVIDER",
      phone: "9841234570",
      address: "Pokhara",
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: "provider5@test.com" },
    update: {},
    create: {
      name: "Bikash Tamang",
      email: "provider5@test.com",
      password: "hashed_password_here",
      role: "PROVIDER",
      phone: "9841234571",
      address: "Kathmandu",
    },
  });

  const user6 = await prisma.user.upsert({
    where: { email: "provider6@test.com" },
    update: {},
    create: {
      name: "Sunita Rai",
      email: "provider6@test.com",
      password: "hashed_password_here",
      role: "PROVIDER",
      phone: "9841234572",
      address: "Lalitpur",
    },
  });

  console.log("✅ Users seeded");

  /* ------------------ PROVIDERS ------------------ */
  const provider1 = await prisma.provider.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      legalName: "Ram Plumbing Services",
      experienceYears: 8,
      bio: "Expert plumber with 8 years of experience in residential and commercial plumbing",
      serviceArea: "Kathmandu Valley",
      availability: "Mon-Sat 8AM-6PM",
      verificationStatus: "VERIFIED",
      trustScore: 4.8,
    },
  });

  const provider2 = await prisma.provider.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      legalName: "Sita Cleaning Solutions",
      experienceYears: 5,
      bio: "Professional cleaning service for homes and offices",
      serviceArea: "Lalitpur, Kathmandu",
      availability: "Daily 7AM-7PM",
      verificationStatus: "VERIFIED",
      trustScore: 4.9,
    },
  });

  const provider3 = await prisma.provider.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      legalName: "Krishna Electric Works",
      experienceYears: 10,
      bio: "Certified electrician specializing in home wiring and repairs",
      serviceArea: "Bhaktapur, Kathmandu",
      availability: "Mon-Fri 9AM-5PM",
      verificationStatus: "VERIFIED",
      trustScore: 4.7,
    },
  });

  const provider4 = await prisma.provider.upsert({
    where: { userId: user4.id },
    update: {},
    create: {
      userId: user4.id,
      legalName: "Maya Painting & Decor",
      experienceYears: 6,
      bio: "Interior and exterior painting specialist",
      serviceArea: "Pokhara, Kathmandu",
      availability: "Mon-Sat 8AM-5PM",
      verificationStatus: "VERIFIED",
      trustScore: 4.6,
    },
  });

  const provider5 = await prisma.provider.upsert({
    where: { userId: user5.id },
    update: {},
    create: {
      userId: user5.id,
      legalName: "Bikash Movers & Packers",
      experienceYears: 7,
      bio: "Reliable moving services with careful handling",
      serviceArea: "Nationwide",
      availability: "Daily 6AM-8PM",
      verificationStatus: "VERIFIED",
      trustScore: 4.8,
    },
  });

  const provider6 = await prisma.provider.upsert({
    where: { userId: user6.id },
    update: {},
    create: {
      userId: user6.id,
      legalName: "Sunita Garden Care",
      experienceYears: 4,
      bio: "Professional gardening and landscaping services",
      serviceArea: "Kathmandu Valley",
      availability: "Mon-Sat 7AM-4PM",
      verificationStatus: "VERIFIED",
      trustScore: 4.7,
    },
  });

  console.log("✅ Providers seeded");

  /* ------------------ SERVICES ------------------ */
  await prisma.service.createMany({
    data: [
      // Home Repair - Plumbing
      {
        title: "Plumbing",
        icon: "🔧",
        description: "Complete plumbing services including leak repairs, pipe installation, and drain cleaning",
        price: 1500,
        duration: "2-3 hours",
        availability: "Mon-Sat 8AM-6PM",
        providerId: provider1.id,
        categoryId: categories[0].id, // Home Repair
      },
      // Home Repair - Electrical
      {
        title: "Electrical",
        icon: "⚡",
        description: "Professional electrical services for wiring, switches, outlets, and circuit repairs",
        price: 1800,
        duration: "2-4 hours",
        availability: "Mon-Fri 9AM-5PM",
        providerId: provider3.id,
        categoryId: categories[0].id, // Home Repair
      },
      // Home Repair - AC Repair
      {
        title: "AC Repair",
        icon: "❄️",
        description: "Air conditioning repair, maintenance, and installation services",
        price: 2500,
        duration: "3-5 hours",
        availability: "Mon-Sat 8AM-6PM",
        providerId: provider3.id,
        categoryId: categories[0].id, // Home Repair
      },
      // Home Repair - Appliance Repair
      {
        title: "Appliance Repair",
        icon: "🔌",
        description: "Repair services for refrigerators, washing machines, and other home appliances",
        price: 2000,
        duration: "2-4 hours",
        availability: "Mon-Sat 8AM-6PM",
        providerId: provider1.id,
        categoryId: categories[0].id, // Home Repair
      },
      // Home Repair - Carpentry
      {
        title: "Carpentry",
        icon: "🪚",
        description: "Custom woodwork, furniture repair, and carpentry services",
        price: 2200,
        duration: "4-6 hours",
        availability: "Mon-Sat 8AM-5PM",
        providerId: provider3.id,
        categoryId: categories[0].id, // Home Repair
      },
      // Cleaning - House Cleaning
      {
        title: "House Cleaning",
        icon: "🧹",
        description: "Regular house cleaning services including dusting, mopping, and sanitizing",
        price: 1200,
        duration: "3-4 hours",
        availability: "Daily 7AM-7PM",
        providerId: provider2.id,
        categoryId: categories[1].id, // Cleaning
      },
      // Cleaning - Deep Cleaning
      {
        title: "Deep Cleaning",
        icon: "✨",
        description: "Thorough deep cleaning service for entire home including hard-to-reach areas",
        price: 2500,
        duration: "6-8 hours",
        availability: "Daily 7AM-7PM",
        providerId: provider2.id,
        categoryId: categories[1].id, // Cleaning
      },
      // Home Improvement - Interior Painting
      {
        title: "Interior Painting",
        icon: "🎨",
        description: "Professional interior painting services with premium quality paints",
        price: 3500,
        duration: "1-2 days",
        availability: "Mon-Sat 8AM-5PM",
        providerId: provider4.id,
        categoryId: categories[2].id, // Home Improvement
      },
      // Moving - Moving Services
      {
        title: "Moving Services",
        icon: "🚚",
        description: "Professional packing, loading, and moving services for home and office relocation",
        price: 5000,
        duration: "Full day",
        availability: "Daily 6AM-8PM",
        providerId: provider5.id,
        categoryId: categories[3].id, // Moving
      },
      // Security - Home Security
      {
        title: "Home Security",
        icon: "🔒",
        description: "Installation of CCTV cameras, alarm systems, and smart home security solutions",
        price: 8000,
        duration: "4-6 hours",
        availability: "Mon-Fri 9AM-5PM",
        providerId: provider3.id,
        categoryId: categories[4].id, // Security
      },
      // Home Maintenance - Pest Control
      {
        title: "Pest Control",
        icon: "🐜",
        description: "Comprehensive pest control services for termites, rodents, and insects",
        price: 1800,
        duration: "2-3 hours",
        availability: "Mon-Sat 8AM-6PM",
        providerId: provider1.id,
        categoryId: categories[5].id, // Home Maintenance
      },
      // Outdoor - Gardening
      {
        title: "Gardening",
        icon: "🌿",
        description: "Professional gardening services including lawn care, plant maintenance, and landscaping",
        price: 1500,
        duration: "3-4 hours",
        availability: "Mon-Sat 7AM-4PM",
        providerId: provider6.id,
        categoryId: categories[6].id, // Outdoor
      },

    ],
  });

  console.log("✅ Services seeded");

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

