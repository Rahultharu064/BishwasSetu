import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Admin ──────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bishwasetu.com' },
    update: {},
    create: {
      email: 'admin@bishwasetu.com',
      name: 'System Admin',
      phone: '9800000000',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.id);

  // ── Categories ─────────────────────────────────────────────────
  const CATS = [
    { name: 'Plumbing', nameNp: 'प्लम्बिङ', slug: 'plumbing', icon: '🔧', description: 'Pipe installation, repair, and maintenance services', sortOrder: 1 },
    { name: 'Electrical', nameNp: 'इलेक्ट्रिकल', slug: 'electrical', icon: '⚡', description: 'Electrical wiring, repair, and installation services', sortOrder: 2 },
    { name: 'Cleaning', nameNp: 'सफाई', slug: 'cleaning', icon: '🧹', description: 'Home and office cleaning services', sortOrder: 3 },
    { name: 'Carpentry', nameNp: 'काठको काम', slug: 'carpentry', icon: '🔨', description: 'Woodworking, furniture repair, and installation', sortOrder: 4 },
    { name: 'Painting', nameNp: 'रङरोगन', slug: 'painting', icon: '🎨', description: 'Interior and exterior painting services', sortOrder: 5 },
    { name: 'Gardening', nameNp: 'बगैंचा हेरचाह', slug: 'gardening', icon: '🌱', description: 'Lawn care, landscaping, and garden maintenance', sortOrder: 6 },
  ];
  const categories = await Promise.all(
    CATS.map((c) =>
      prisma.category.upsert({ where: { name: c.name }, update: {}, create: c })
    )
  );
  console.log('✅ Categories created:', categories.length);
  const [plumbing, electrical, cleaning, carpentry, painting, gardening] = categories;

  // ── Sub-categories + Services (Level 2 + 3 catalog) ─────────────
  const SUBCAT_PLAN: Record<string, { name: string; nameNp: string; slug: string; services: { name: string; nameNp: string; slug: string; pricingType: string; priceMin?: number; priceMax?: number; priceFixed?: number; priceUnit: string }[] }[]> = {
    [plumbing.id]: [
      {
        name: 'Pipe Work', nameNp: 'पाइप काम', slug: 'pipe-work',
        services: [
          { name: 'Leak Repair', nameNp: 'चुहावट मर्मत', slug: 'leak-repair', pricingType: 'range', priceMin: 500, priceMax: 1500, priceUnit: 'per visit' },
          { name: 'Pipe Installation', nameNp: 'पाइप जडान', slug: 'pipe-installation', pricingType: 'quote', priceUnit: 'per visit' },
        ],
      },
      {
        name: 'Water Heater', nameNp: 'पानी तताउने यन्त्र', slug: 'water-heater',
        services: [
          { name: 'Water Heater Installation', nameNp: 'वाटर हिटर जडान', slug: 'installation', pricingType: 'fixed', priceFixed: 2500, priceUnit: 'per visit' },
        ],
      },
    ],
    [electrical.id]: [
      {
        name: 'Wiring & Circuits', nameNp: 'तार तथा सर्किट', slug: 'wiring-circuits',
        services: [
          { name: 'Wiring & Circuit Repair', nameNp: 'तार तथा सर्किट मर्मत', slug: 'circuit-repair', pricingType: 'range', priceMin: 800, priceMax: 3000, priceUnit: 'per visit' },
        ],
      },
      {
        name: 'Appliance Installation', nameNp: 'उपकरण जडान', slug: 'appliance-installation',
        services: [
          { name: 'Appliance Installation', nameNp: 'उपकरण जडान', slug: 'installation', pricingType: 'fixed', priceFixed: 1500, priceUnit: 'per visit' },
        ],
      },
    ],
    [cleaning.id]: [
      {
        name: 'Home Cleaning', nameNp: 'घर सफाई', slug: 'home-cleaning',
        services: [
          { name: 'Deep House Cleaning', nameNp: 'गहिरो घर सफाई', slug: 'deep-clean', pricingType: 'range', priceMin: 1500, priceMax: 4000, priceUnit: 'per visit' },
        ],
      },
      {
        name: 'Office Cleaning', nameNp: 'कार्यालय सफाई', slug: 'office-cleaning',
        services: [
          { name: 'Office Cleaning', nameNp: 'कार्यालय सफाई', slug: 'regular', pricingType: 'quote', priceUnit: 'per visit' },
        ],
      },
    ],
    [carpentry.id]: [
      {
        name: 'Furniture Repair', nameNp: 'फर्निचर मर्मत', slug: 'furniture-repair',
        services: [
          { name: 'Furniture Repair', nameNp: 'फर्निचर मर्मत', slug: 'repair', pricingType: 'range', priceMin: 500, priceMax: 2500, priceUnit: 'per item' },
        ],
      },
      {
        name: 'Custom Furniture', nameNp: 'अनुकूलित फर्निचर', slug: 'custom-furniture',
        services: [
          { name: 'Custom Furniture', nameNp: 'अनुकूलित फर्निचर', slug: 'design-build', pricingType: 'quote', priceUnit: 'per project' },
        ],
      },
    ],
    [painting.id]: [
      {
        name: 'Interior Painting', nameNp: 'भित्री रङरोगन', slug: 'interior-painting',
        services: [
          { name: 'Interior Wall Painting', nameNp: 'भित्री भित्ता रङरोगन', slug: 'wall-painting', pricingType: 'range', priceMin: 8, priceMax: 15, priceUnit: 'per sq ft' },
        ],
      },
      {
        name: 'Exterior Painting', nameNp: 'बाहिरी रङरोगन', slug: 'exterior-painting',
        services: [
          { name: 'Exterior House Painting', nameNp: 'बाहिरी घर रङरोगन', slug: 'house-painting', pricingType: 'range', priceMin: 10, priceMax: 20, priceUnit: 'per sq ft' },
        ],
      },
    ],
    [gardening.id]: [
      {
        name: 'Lawn Care', nameNp: 'लन हेरचाह', slug: 'lawn-care',
        services: [
          { name: 'Lawn Mowing & Trimming', nameNp: 'घाँस काट्ने', slug: 'mowing', pricingType: 'fixed', priceFixed: 800, priceUnit: 'per visit' },
        ],
      },
    ],
  };

  let subCategoryCount = 0;
  let serviceCount = 0;
  const firstServiceByCategory = new Map<string, string>();

  for (const [categoryId, subcats] of Object.entries(SUBCAT_PLAN)) {
    for (let i = 0; i < subcats.length; i++) {
      const sc = subcats[i];
      const subCategory = await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId, slug: sc.slug } },
        update: {},
        create: {
          categoryId,
          name: sc.name,
          nameNp: sc.nameNp,
          slug: sc.slug,
          sortOrder: i,
        },
      });
      subCategoryCount++;

      for (let j = 0; j < sc.services.length; j++) {
        const svc = sc.services[j];
        const service = await prisma.service.upsert({
          where: { subCategoryId_slug: { subCategoryId: subCategory.id, slug: svc.slug } },
          update: {},
          create: {
            subCategoryId: subCategory.id,
            name: svc.name,
            nameNp: svc.nameNp,
            slug: svc.slug,
            pricingType: svc.pricingType,
            priceMin: svc.priceMin,
            priceMax: svc.priceMax,
            priceFixed: svc.priceFixed,
            priceUnit: svc.priceUnit,
            sortOrder: j,
          },
        });
        serviceCount++;
        if (!firstServiceByCategory.has(categoryId)) {
          firstServiceByCategory.set(categoryId, service.id);
        }
      }
    }
  }
  console.log('✅ Sub-categories created:', subCategoryCount);
  console.log('✅ Services created:', serviceCount);

  // ── Customer users ───────────────────────────────────────────────
  const customerSeeds = [
    { email: 'ram.sharma@example.com', name: 'Ram Sharma', phone: '9811123456', city: 'Kathmandu Metropolitan City', district: 'Kathmandu' },
    { email: 'sita.thapa@example.com', name: 'Sita Thapa', phone: '9823456789', city: 'Kathmandu Metropolitan City', district: 'Kathmandu' },
    { email: 'hari.pokhrel@example.com', name: 'Hari Pokhrel', phone: '9834567890', city: 'Pokhara Metropolitan City', district: 'Kaski' },
  ];
  const customerPasswordHash = await hashPassword('customer123');
  const customerUsers = await Promise.all(
    customerSeeds.map((c) =>
      prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: {
          email: c.email,
          name: c.name,
          phone: c.phone,
          city: c.city,
          district: c.district,
          passwordHash: customerPasswordHash,
          role: 'CUSTOMER',
          isActive: true,
        },
      })
    )
  );
  console.log('✅ Customer users created:', customerUsers.length);

  // ── Provider users + profiles ────────────────────────────────────
  const KTM = { latitude: 27.7172, longitude: 85.3240 };
  const PKR = { latitude: 28.2096, longitude: 83.9856 };
  const providerPasswordHash = await hashPassword('provider123');

  const providerSeeds = [
    {
      email: 'bikash.plumber@example.com', name: 'Bikash Gurung', phone: '9845678901',
      city: 'Kathmandu Metropolitan City', district: 'Kathmandu', ...KTM,
      categoryId: plumbing.id,
      legalName: 'Bikash Plumbing Services',
      bio: 'Professional plumber with 8 years of experience in residential and commercial plumbing services.',
      serviceArea: 'Kathmandu', yearsExperience: 8, trustScore: 4.8,
    },
    {
      email: 'madan.electric@example.com', name: 'Madan Bhattarai', phone: '9856789012',
      city: 'Kathmandu Metropolitan City', district: 'Kathmandu', ...KTM,
      categoryId: electrical.id,
      legalName: 'Madan Electrical Services',
      bio: 'Licensed electrician specializing in home wiring, appliance repair, and electrical safety inspections.',
      serviceArea: 'Kathmandu', yearsExperience: 6, trustScore: 4.6,
    },
    {
      email: 'saraswati.clean@example.com', name: 'Saraswati Lama', phone: '9867890123',
      city: 'Kathmandu Metropolitan City', district: 'Kathmandu', ...KTM,
      categoryId: cleaning.id,
      legalName: 'Saraswati Cleaning Services',
      bio: 'Professional cleaner providing thorough and reliable cleaning services for homes and offices.',
      serviceArea: 'Kathmandu', yearsExperience: 4, trustScore: 4.7,
    },
    {
      email: 'rajesh.carpenter@example.com', name: 'Rajesh Thakuri', phone: '9878901234',
      city: 'Pokhara Metropolitan City', district: 'Kaski', ...PKR,
      categoryId: carpentry.id,
      legalName: 'Rajesh Carpentry Works',
      bio: 'Experienced carpenter specializing in furniture making, repairs, and custom woodwork.',
      serviceArea: 'Kaski', yearsExperience: 12, trustScore: 4.9,
    },
    {
      email: 'nirmala.painter@example.com', name: 'Nirmala Rai', phone: '9889012345',
      city: 'Pokhara Metropolitan City', district: 'Kaski', ...PKR,
      categoryId: painting.id,
      legalName: 'Nirmala Painting Services',
      bio: 'Professional painter offering interior and exterior painting services with quality materials.',
      serviceArea: 'Kaski', yearsExperience: 7, trustScore: 4.5,
    },
  ];

  const providers = [];
  for (const p of providerSeeds) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        name: p.name,
        phone: p.phone,
        city: p.city,
        district: p.district,
        passwordHash: providerPasswordHash,
        role: 'PROVIDER',
        isActive: true,
      },
    });

    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        legalName: p.legalName,
        bio: p.bio,
        serviceArea: p.serviceArea,
        city: p.city,
        yearsExperience: p.yearsExperience,
        identityStatus: 'VERIFIED',
        skillStatus: 'VERIFIED',
        milestoneBadge: 'ESTABLISHED',
        kycTier: 'TIER_2_SKILLED',
        completedBookings: 6,
        trustScore: p.trustScore,
        totalRevenue: 0,
        isAvailable: true,
        latitude: p.latitude,
        longitude: p.longitude,
      },
    });

    await prisma.providerCategory.upsert({
      where: { providerId_categoryId: { providerId: provider.id, categoryId: p.categoryId } },
      update: {},
      create: { providerId: provider.id, categoryId: p.categoryId },
    });

    // KYC documents — idempotent guard since KycDocument has no unique key
    const existingDocs = await prisma.kycDocument.count({ where: { providerId: provider.id } });
    if (existingDocs === 0) {
      await prisma.kycDocument.createMany({
        data: [
          { providerId: provider.id, type: 'government_id', cloudinaryId: `seed/${user.id}-citizenship`, url: `/uploads/kyc/government-id/${user.id}.jpg` },
          { providerId: provider.id, type: 'selfie', cloudinaryId: `seed/${user.id}-selfie`, url: `/uploads/kyc/selfie/${user.id}.jpg` },
        ],
      });
    }

    await prisma.creditWallet.upsert({
      where: { providerId: provider.id },
      update: {},
      create: { providerId: provider.id, balance: 50, totalEarned: 50, totalSpent: 0 },
    });

    providers.push({ ...provider, categoryId: p.categoryId, userId: user.id });
  }
  console.log('✅ Provider profiles created:', providers.length);

  // ── Bookings + reviews (only on a clean DB — no unique key to upsert on) ──
  const existingBookings = await prisma.booking.count();
  if (existingBookings === 0) {
    const bookingSeeds = [
      { customer: customerUsers[0], provider: providers[0], status: 'COMPLETED' as const, daysAgo: 15, notes: 'Leaking kitchen faucet needs urgent repair' },
      { customer: customerUsers[1], provider: providers[1], status: 'ACCEPTED' as const, daysAgo: -5, notes: 'Need to fix bedroom light circuit' },
      { customer: customerUsers[2], provider: providers[3], status: 'REQUESTED' as const, daysAgo: -10, notes: 'Chair legs need repair' },
      { customer: customerUsers[0], provider: providers[2], status: 'IN_PROGRESS' as const, daysAgo: -2, notes: 'Deep cleaning for 3BHK apartment' },
      { customer: customerUsers[1], provider: providers[4], status: 'COMPLETED' as const, daysAgo: 20, notes: 'Paint living room walls' },
    ];

    const bookings = [];
    for (const b of bookingSeeds) {
      const scheduledAt = new Date(Date.now() - b.daysAgo * 24 * 60 * 60 * 1000);
      const booking = await prisma.booking.create({
        data: {
          customerId: b.customer.id,
          providerId: b.provider.id,
          categoryId: b.provider.categoryId,
          status: b.status,
          escrowStatus: b.status === 'COMPLETED' ? 'RELEASED' : 'NONE',
          description: b.notes,
          scheduledAt,
          completedAt: b.status === 'COMPLETED' ? scheduledAt : null,
          priceNpr: 2000,
          paymentMethod: 'CASH',
        },
      });
      bookings.push(booking);
    }
    console.log('✅ Bookings created:', bookings.length);

    const reviewSeeds = [
      { booking: bookings[0], customer: customerUsers[0], provider: providers[0], rating: 5, comment: 'Excellent plumbing service! Bikash fixed the kitchen faucet leak quickly and professionally.', providerReply: 'Thank you Ram! Glad I could help resolve the leak quickly.' },
      { booking: bookings[4], customer: customerUsers[1], provider: providers[4], rating: 4, comment: 'Nirmala did a great job painting our living room. Very neat work, though it took slightly longer than estimated.' },
    ];
    const reviews = await Promise.all(
      reviewSeeds.map((r) =>
        prisma.review.create({
          data: {
            bookingId: r.booking.id,
            customerId: r.customer.id,
            providerId: r.provider.id,
            rating: r.rating,
            comment: r.comment,
            providerReply: r.providerReply,
            isAuthentic: true,
            isVisible: true,
          },
        })
      )
    );
    console.log('✅ Reviews seeded:', reviews.length);
  } else {
    console.log('ℹ️ Bookings already exist — skipping booking/review seed to avoid duplicates');
  }

  console.log('🎉 Seed completed successfully!');
  console.log('Admin login: admin@bishwasetu.com / admin123');
  console.log('Customer login: ram.sharma@example.com / customer123');
  console.log('Provider login: bikash.plumber@example.com / provider123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
