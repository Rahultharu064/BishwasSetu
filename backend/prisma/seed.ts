import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password function
  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  // Create Admin User
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bishwasetu.com' },
    update: {},
    create: {
      email: 'admin@bishwasetu.com',
      name: 'System Admin',
      phone: '9800000000',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.id);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Plumbing' },
      update: {},
      create: {
        name: 'Plumbing',
        nameNp: 'प्लम्बिङ',
        slug: 'plumbing',
        icon: '🔧',
        description: 'Pipe installation, repair, and maintenance services',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Electrical' },
      update: {},
      create: {
        name: 'Electrical',
        nameNp: 'इलेक्ट्रिकल',
        slug: 'electrical',
        icon: '⚡',
        description: 'Electrical wiring, repair, and installation services',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Cleaning' },
      update: {},
      create: {
        name: 'Cleaning',
        nameNp: 'सफाई',
        slug: 'cleaning',
        icon: '🧹',
        description: 'Home and office cleaning services',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Carpentry' },
      update: {},
      create: {
        name: 'Carpentry',
        nameNp: 'काठको काम',
        slug: 'carpentry',
        icon: '🔨',
        description: 'Woodworking, furniture repair, and installation',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Painting' },
      update: {},
      create: {
        name: 'Painting',
        nameNp: 'रङरोगन',
        slug: 'painting',
        icon: '🎨',
        description: 'Interior and exterior painting services',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Gardening' },
      update: {},
      create: {
        name: 'Gardening',
        nameNp: 'बगैंचा हेरचाह',
        slug: 'gardening',
        icon: '🌱',
        description: 'Lawn care, landscaping, and garden maintenance',
        sortOrder: 6,
      },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create Customer Users
  const customerUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ram.sharma@example.com' },
      update: {},
      create: {
        email: 'ram.sharma@example.com',
        name: 'Ram Sharma',
        phone: '9812345678',
        address: 'Baneshwor, Kathmandu',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        gender: 'Male',
        password: await hashPassword('customer123'),
        role: 'CUSTOMER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sita.thapa@example.com' },
      update: {},
      create: {
        email: 'sita.thapa@example.com',
        name: 'Sita Thapa',
        phone: '9823456789',
        address: 'Lazimpat, Kathmandu',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        gender: 'Female',
        password: await hashPassword('customer123'),
        role: 'CUSTOMER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'hari.pokhrel@example.com' },
      update: {},
      create: {
        email: 'hari.pokhrel@example.com',
        name: 'Hari Pokhrel',
        phone: '9834567890',
        address: 'Pokhara-6, Kaski',
        district: 'Kaski',
        municipality: 'Pokhara Metropolitan City',
        gender: 'Male',
        password: await hashPassword('customer123'),
        role: 'CUSTOMER',
        isVerified: true,
      },
    }),
  ]);
  console.log('✅ Customer users created:', customerUsers.length);

  // Create Provider Users
  const providerUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'bikash.plumber@example.com' },
      update: {},
      create: {
        email: 'bikash.plumber@example.com',
        name: 'Bikash Gurung',
        phone: '9845678901',
        address: 'Kalanki, Kathmandu',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        gender: 'Male',
        password: await hashPassword('provider123'),
        role: 'PROVIDER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'madan.electric@example.com' },
      update: {},
      create: {
        email: 'madan.electric@example.com',
        name: 'Madan Bhattarai',
        phone: '9856789012',
        address: 'Chabahil, Kathmandu',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        gender: 'Male',
        password: await hashPassword('provider123'),
        role: 'PROVIDER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'saraswati.clean@example.com' },
      update: {},
      create: {
        email: 'saraswati.clean@example.com',
        name: 'Saraswati Lama',
        phone: '9867890123',
        address: 'Thamel, Kathmandu',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        gender: 'Female',
        password: await hashPassword('provider123'),
        role: 'PROVIDER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'rajesh.carpenter@example.com' },
      update: {},
      create: {
        email: 'rajesh.carpenter@example.com',
        name: 'Rajesh Thakuri',
        phone: '9878901234',
        address: 'Pokhara-1, Kaski',
        district: 'Kaski',
        municipality: 'Pokhara Metropolitan City',
        gender: 'Male',
        password: await hashPassword('provider123'),
        role: 'PROVIDER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'nirmala.painter@example.com' },
      update: {},
      create: {
        email: 'nirmala.painter@example.com',
        name: 'Nirmala Rai',
        phone: '9889012345',
        address: 'Lakeside, Pokhara',
        district: 'Kaski',
        municipality: 'Pokhara Metropolitan City',
        gender: 'Female',
        password: await hashPassword('provider123'),
        role: 'PROVIDER',
        isVerified: true,
      },
    }),
  ]);
  console.log('✅ Provider users created:', providerUsers.length);

  // Create Provider Profiles
  const providers = await Promise.all([
    // Plumbing Provider
    prisma.provider.upsert({
      where: { userId: providerUsers[0].id },
      update: {},
      create: {
        userId: providerUsers[0].id,
        categoryId: categories[0].id, // Plumbing
        legalName: 'Bikash Plumbing Services',
        experienceYears: 8,
        bio: 'Professional plumber with 8 years of experience in residential and commercial plumbing services.',
        skills: 'Pipe repair, Installation, Leak detection, Water heater repair',
        prevCompany: 'ABC Plumbing Co.',
        prevRole: 'Senior Plumber',
        workDuration: '5 years',
        portfolioUrls: 'https://example.com/portfolio1',
        serviceDistrict: 'Kathmandu',
        serviceMunicipality: 'Kathmandu Metropolitan City',
        availabilityDays: 'Monday-Saturday',
        availabilityTime: '9:00 AM - 6:00 PM',
        isEmergencyAvailable: true,
        emergencyResponseTime: '2 hours',
        emergencyExtraCharge: 1000,
        price: 2500,
        duration: '2-4 hours',
        profilePhotoUrl: '/uploads/images/profile-photos/plumber.jpg',
        verificationStatus: 'VERIFIED',
        trustScore: 4.8,
        updatedAt: new Date(),
      },
    }),
    // Electrical Provider
    prisma.provider.upsert({
      where: { userId: providerUsers[1].id },
      update: {},
      create: {
        userId: providerUsers[1].id,
        categoryId: categories[1].id, // Electrical
        legalName: 'Madan Electrical Services',
        experienceYears: 6,
        bio: 'Licensed electrician specializing in home wiring, appliance repair, and electrical safety inspections.',
        skills: 'Wiring, Circuit repair, Appliance installation, Safety inspections',
        prevCompany: 'XYZ Electrical Ltd.',
        prevRole: 'Master Electrician',
        workDuration: '4 years',
        portfolioUrls: 'https://example.com/portfolio2',
        serviceDistrict: 'Kathmandu',
        serviceMunicipality: 'Kathmandu Metropolitan City',
        availabilityDays: 'Monday-Sunday',
        availabilityTime: '8:00 AM - 8:00 PM',
        isEmergencyAvailable: true,
        emergencyResponseTime: '1 hour',
        emergencyExtraCharge: 1500,
        price: 3000,
        duration: '1-3 hours',
        profilePhotoUrl: '/uploads/images/profile-photos/electrician.jpg',
        verificationStatus: 'VERIFIED',
        trustScore: 4.6,
        updatedAt: new Date(),
      },
    }),
    // Cleaning Provider
    prisma.provider.upsert({
      where: { userId: providerUsers[2].id },
      update: {},
      create: {
        userId: providerUsers[2].id,
        categoryId: categories[2].id, // Cleaning
        legalName: 'Saraswati Cleaning Services',
        experienceYears: 4,
        bio: 'Professional cleaner providing thorough and reliable cleaning services for homes and offices.',
        skills: 'Deep cleaning, Regular cleaning, Office cleaning, Eco-friendly products',
        prevCompany: 'Clean Nepal Pvt. Ltd.',
        prevRole: 'Lead Cleaner',
        workDuration: '3 years',
        portfolioUrls: 'https://example.com/portfolio3',
        serviceDistrict: 'Kathmandu',
        serviceMunicipality: 'Kathmandu Metropolitan City',
        availabilityDays: 'Monday-Saturday',
        availabilityTime: '7:00 AM - 5:00 PM',
        isEmergencyAvailable: false,
        price: 1500,
        duration: '3-5 hours',
        profilePhotoUrl: '/uploads/images/profile-photos/cleaner.jpg',
        verificationStatus: 'VERIFIED',
        trustScore: 4.7,
        updatedAt: new Date(),
      },
    }),
    // Carpentry Provider
    prisma.provider.upsert({
      where: { userId: providerUsers[3].id },
      update: {},
      create: {
        userId: providerUsers[3].id,
        categoryId: categories[3].id, // Carpentry
        legalName: 'Rajesh Carpentry Works',
        experienceYears: 12,
        bio: 'Experienced carpenter specializing in furniture making, repairs, and custom woodwork.',
        skills: 'Furniture repair, Custom furniture, Door installation, Wood finishing',
        prevCompany: 'Pokhara Woodcraft',
        prevRole: 'Master Carpenter',
        workDuration: '8 years',
        portfolioUrls: 'https://example.com/portfolio4',
        serviceDistrict: 'Kaski',
        serviceMunicipality: 'Pokhara Metropolitan City',
        availabilityDays: 'Tuesday-Sunday',
        availabilityTime: '9:00 AM - 7:00 PM',
        isEmergencyAvailable: false,
        price: 3500,
        duration: '4-8 hours',
        profilePhotoUrl: '/uploads/images/profile-photos/carpenter.jpg',
        verificationStatus: 'VERIFIED',
        trustScore: 4.9,
        updatedAt: new Date(),
      },
    }),
    // Painting Provider
    prisma.provider.upsert({
      where: { userId: providerUsers[4].id },
      update: {},
      create: {
        userId: providerUsers[4].id,
        categoryId: categories[4].id, // Painting
        legalName: 'Nirmala Painting Services',
        experienceYears: 7,
        bio: 'Professional painter offering interior and exterior painting services with quality materials.',
        skills: 'Interior painting, Exterior painting, Wall preparation, Color consultation',
        prevCompany: 'Rainbow Paints Nepal',
        prevRole: 'Senior Painter',
        workDuration: '5 years',
        portfolioUrls: 'https://example.com/portfolio5',
        serviceDistrict: 'Kaski',
        serviceMunicipality: 'Pokhara Metropolitan City',
        availabilityDays: 'Monday-Saturday',
        availabilityTime: '8:00 AM - 6:00 PM',
        isEmergencyAvailable: false,
        price: 2800,
        duration: '5-7 hours',
        profilePhotoUrl: '/uploads/images/profile-photos/painter.jpg',
        verificationStatus: 'VERIFIED',
        trustScore: 4.5,
        updatedAt: new Date(),
      },
    }),
  ]);
  console.log('✅ Provider profiles created:', providers.length);

  // Create KYC Documents for Providers
  const kycDocuments = await Promise.all([
    // Bikash's KYC
    prisma.kycdocument.create({
      data: {
        providerId: providers[0].id,
        type: 'GOVERNMENT_ID',
        fileUrl: '/uploads/kyc/government-id/bikash-citizenship.jpg',
        status: 'APPROVED',
      },
    }),
    prisma.kycdocument.create({
      data: {
        providerId: providers[0].id,
        type: 'PROFILE_PHOTO',
        fileUrl: '/uploads/images/profile-photos/bikash-profile.jpg',
        status: 'APPROVED',
      },
    }),
    prisma.kycdocument.create({
      data: {
        providerId: providers[0].id,
        type: 'CERTIFICATE',
        fileUrl: '/uploads/kyc/certificates/bikash-plumbing-cert.jpg',
        status: 'APPROVED',
      },
    }),
    // Madan's KYC
    prisma.kycdocument.create({
      data: {
        providerId: providers[1].id,
        type: 'GOVERNMENT_ID',
        fileUrl: '/uploads/kyc/government-id/madan-citizenship.jpg',
        status: 'APPROVED',
      },
    }),
    prisma.kycdocument.create({
      data: {
        providerId: providers[1].id,
        type: 'PROFILE_PHOTO',
        fileUrl: '/uploads/images/profile-photos/madan-profile.jpg',
        status: 'APPROVED',
      },
    }),
    // Saraswati's KYC
    prisma.kycdocument.create({
      data: {
        providerId: providers[2].id,
        type: 'GOVERNMENT_ID',
        fileUrl: '/uploads/kyc/government-id/saraswati-citizenship.jpg',
        status: 'APPROVED',
      },
    }),
    prisma.kycdocument.create({
      data: {
        providerId: providers[2].id,
        type: 'PROFILE_PHOTO',
        fileUrl: '/uploads/images/profile-photos/saraswati-profile.jpg',
        status: 'APPROVED',
      },
    }),
    // Rajesh's KYC
    prisma.kycdocument.create({
      data: {
        providerId: providers[3].id,
        type: 'GOVERNMENT_ID',
        fileUrl: '/uploads/kyc/government-id/rajesh-citizenship.jpg',
        status: 'APPROVED',
      },
    }),
    prisma.kycdocument.create({
      data: {
        providerId: providers[3].id,
        type: 'PROFILE_PHOTO',
        fileUrl: '/uploads/images/profile-photos/rajesh-profile.jpg',
        status: 'APPROVED',
      },
    }),
    // Nirmala's KYC
    prisma.kycdocument.create({
      data: {
        providerId: providers[4].id,
        type: 'GOVERNMENT_ID',
        fileUrl: '/uploads/kyc/government-id/nirmala-citizenship.jpg',
        status: 'APPROVED',
      },
    }),
    prisma.kycdocument.create({
      data: {
        providerId: providers[4].id,
        type: 'PROFILE_PHOTO',
        fileUrl: '/uploads/images/profile-photos/nirmala-profile.jpg',
        status: 'APPROVED',
      },
    }),
  ]);
  console.log('✅ KYC documents created:', kycDocuments.length);

  // Create Services
  const services = await Promise.all([
    // Plumbing Services
    prisma.service.create({
      data: {
        providerId: providers[0].id,
        categoryId: categories[0].id,
        title: 'Pipe Leak Repair',
        icon: '🔧',
        description: 'Fix leaking pipes, faucets, and water connections. Emergency service available.',
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        providerId: providers[0].id,
        categoryId: categories[0].id,
        title: 'Water Heater Installation',
        icon: '🔥',
        description: 'Install and repair electric and gas water heaters.',
        updatedAt: new Date(),
      },
    }),
    // Electrical Services
    prisma.service.create({
      data: {
        providerId: providers[1].id,
        categoryId: categories[1].id,
        title: 'Wiring and Circuit Repair',
        icon: '⚡',
        description: 'Fix electrical wiring issues, circuit breakers, and outlets.',
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        providerId: providers[1].id,
        categoryId: categories[1].id,
        title: 'Appliance Installation',
        icon: '🔌',
        description: 'Install electrical appliances and ensure proper connections.',
        updatedAt: new Date(),
      },
    }),
    // Cleaning Services
    prisma.service.create({
      data: {
        providerId: providers[2].id,
        categoryId: categories[2].id,
        title: 'Deep House Cleaning',
        icon: '🧹',
        description: 'Complete home cleaning including floors, kitchen, bathrooms, and dusting.',
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        providerId: providers[2].id,
        categoryId: categories[2].id,
        title: 'Office Cleaning',
        icon: '🏢',
        description: 'Regular office cleaning and maintenance services.',
        updatedAt: new Date(),
      },
    }),
    // Carpentry Services
    prisma.service.create({
      data: {
        providerId: providers[3].id,
        categoryId: categories[3].id,
        title: 'Furniture Repair',
        icon: '🔨',
        description: 'Repair chairs, tables, cabinets, and other wooden furniture.',
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        providerId: providers[3].id,
        categoryId: categories[3].id,
        title: 'Custom Furniture',
        icon: '🪵',
        description: 'Design and build custom wooden furniture pieces.',
        updatedAt: new Date(),
      },
    }),
    // Painting Services
    prisma.service.create({
      data: {
        providerId: providers[4].id,
        categoryId: categories[4].id,
        title: 'Interior Wall Painting',
        icon: '🎨',
        description: 'Paint interior walls with premium quality paints and finishes.',
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        providerId: providers[4].id,
        categoryId: categories[4].id,
        title: 'Exterior House Painting',
        icon: '🏠',
        description: 'Complete exterior painting with weather-resistant paints.',
        updatedAt: new Date(),
      },
    }),
  ]);
  console.log('✅ Services created:', services.length);

  // Create Bookings
  const bookings = await Promise.all([
    // Completed booking
    prisma.booking.create({
      data: {
        customerId: customerUsers[0].id,
        providerId: providers[0].id,
        serviceId: services[0].id,
        bookingDate: new Date('2025-01-15T10:00:00Z'),
        status: 'COMPLETED',
        notes: 'Leaking kitchen faucet needs urgent repair',
        updatedAt: new Date(),
      },
    }),
    // Accepted booking
    prisma.booking.create({
      data: {
        customerId: customerUsers[1].id,
        providerId: providers[1].id,
        serviceId: services[2].id,
        bookingDate: new Date('2025-01-20T14:00:00Z'),
        status: 'ACCEPTED',
        notes: 'Need to fix bedroom light circuit',
        updatedAt: new Date(),
      },
    }),
    // Pending booking
    prisma.booking.create({
      data: {
        customerId: customerUsers[2].id,
        providerId: providers[3].id,
        serviceId: services[6].id,
        bookingDate: new Date('2025-01-25T11:00:00Z'),
        status: 'PENDING',
        notes: 'Chair legs need repair',
        updatedAt: new Date(),
      },
    }),
    // In progress booking
    prisma.booking.create({
      data: {
        customerId: customerUsers[0].id,
        providerId: providers[2].id,
        serviceId: services[4].id,
        bookingDate: new Date('2025-01-18T09:00:00Z'),
        status: 'IN_PROGRESS',
        notes: 'Deep cleaning for 3BHK apartment',
        updatedAt: new Date(),
      },
    }),
    // Completed booking
    prisma.booking.create({
      data: {
        customerId: customerUsers[1].id,
        providerId: providers[4].id,
        serviceId: services[8].id,
        bookingDate: new Date('2025-01-10T13:00:00Z'),
        status: 'COMPLETED',
        notes: 'Paint living room walls',
        updatedAt: new Date(),
      },
    }),
  ]);
  console.log('✅ Bookings created:', bookings.length);

  // Create Seed Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        bookingId: bookings[0].id,
        customerId: customerUsers[0].id, // Ram Sharma
        providerId: providers[0].id, // Bikash Gurung
        rating: 5,
        comment: 'Excellent plumbing service! Bikash fixed the kitchen faucet leak quickly and professionally.',
        reply: 'Thank you Ram! Glad I could help resolve the leak quickly.',
        isAuthentic: true,
      },
    }),
    prisma.review.create({
      data: {
        bookingId: bookings[4].id,
        customerId: customerUsers[1].id, // Sita Thapa
        providerId: providers[4].id, // Nirmala Rai
        rating: 4,
        comment: 'Nirmala did a great job painting our living room. Very neat work, though it took slightly longer than estimated.',
        isAuthentic: true,
      },
    }),
  ]);
  console.log('✅ Reviews seeded:', reviews.length);

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
