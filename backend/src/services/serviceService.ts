import { prisma } from '../config/db'
import type {
  CreateCategoryInput,
  CreateSubCategoryInput,
  CreateServiceInput,
} from '../validators/serviceValidator'

// ═══════════════════════════════════════════
// CATEGORY — Level 1
// ═══════════════════════════════════════════

// GET all categories (with sub-category count)
export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where:   { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { subCategories: true, providers: true },
      },
    },
  })

  return categories
}

// GET single category with full hierarchy
export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      subCategories: {
        where:   { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          services: {
            where:   { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { services: true } },
        },
      },
      _count: { select: { providers: true } },
    },
  })

  if (!category) {
    throw { code: 'CATEGORY_NOT_FOUND', message: 'Category not found', status: 404 }
  }

  return category
}

// GET providers by category (with trust score + badge)
export const getProvidersByCategory = async (
  categorySlug: string,
  params: {
    serviceArea?: string
    trustMin?:   number
    page:        number
    limit:       number
  }
) => {
  const { serviceArea, trustMin = 0, page, limit } = params
  const skip = (page - 1) * limit

  const category = await prisma.category.findUnique({
    where:  { slug: categorySlug, isActive: true },
    select: { id: true, name: true, nameNp: true },
  })

  if (!category) {
    throw { code: 'CATEGORY_NOT_FOUND', message: 'Category not found', status: 404 }
  }

  const where: Record<string, unknown> = {
    identityStatus: 'VERIFIED',
    trustScore: { gte: trustMin },
    deletedAt:  null,
    categories: { some: { categoryId: category.id } },
  }

  if (serviceArea) {
    where.serviceArea = { contains: serviceArea }
  }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { trustScore: 'desc' },
      include: {
        user:       { select: { name: true } },
        skills:     { select: { skill: true } },
        categories: {
          include: { category: { select: { name: true, nameNp: true, icon: true } } },
        },
        badges: { where: { status: 'ACTIVE' }, select: { badgeType: true } },
      },
    }),
    prisma.provider.count({ where }),
  ])

  // Market price range for this category
  const priceStats = await prisma.booking.aggregate({
    where:  { categoryId: category.id, status: 'COMPLETED' },
    _min:   { priceNpr: true },
    _max:   { priceNpr: true },
    _avg:   { priceNpr: true },
    _count: { id: true },
  })

  // Average trust score in this category
  const trustStats = await prisma.provider.aggregate({
    where:  { categories: { some: { categoryId: category.id } }, identityStatus: 'VERIFIED' },
    _avg:   { trustScore: true },
    _count: { id: true },
  })

  return {
    category,
    providers,
    marketStats: {
      priceMin:        priceStats._min.priceNpr ?? 0,
      priceMax:        priceStats._max.priceNpr ?? 0,
      priceAvg:        Math.round(priceStats._avg.priceNpr ?? 0),
      totalBookings:   priceStats._count.id,
      avgTrustScore:   Math.round(trustStats._avg.trustScore ?? 0),
      totalProviders:  trustStats._count.id,
    },
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// Admin: create category
export const createCategory = async (input: CreateCategoryInput) => {
  const exists = await prisma.category.findUnique({ where: { slug: input.slug } })
  if (exists) {
    throw { code: 'SLUG_EXISTS', message: 'Category slug already in use', status: 409 }
  }
  return prisma.category.create({ data: input })
}

// Admin: update category
export const updateCategory = async (id: string, input: Partial<CreateCategoryInput>) => {
  return prisma.category.update({ where: { id }, data: input })
}

// Admin: toggle active
export const toggleCategory = async (id: string, isActive: boolean) => {
  return prisma.category.update({ where: { id }, data: { isActive } })
}

// ═══════════════════════════════════════════
// SUB-CATEGORY — Level 2
// ═══════════════════════════════════════════

// GET all sub-categories under a category
export const getSubCategories = async (categorySlug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  })

  if (!category) {
    throw { code: 'CATEGORY_NOT_FOUND', message: 'Category not found', status: 404 }
  }

  return prisma.subCategory.findMany({
    where:   { categoryId: category.id, isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { services: true } },
    },
  })
}

// GET single sub-category with its services
export const getSubCategoryBySlug = async (
  categorySlug:    string,
  subCategorySlug: string
) => {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  })

  if (!category) {
    throw { code: 'CATEGORY_NOT_FOUND', message: 'Category not found', status: 404 }
  }

  const subCategory = await prisma.subCategory.findFirst({
    where: { categoryId: category.id, slug: subCategorySlug, isActive: true },
    include: {
      category: { select: { name: true, nameNp: true, slug: true } },
      services: {
        where:   { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!subCategory) {
    throw { code: 'SUBCATEGORY_NOT_FOUND', message: 'Sub-category not found', status: 404 }
  }

  return subCategory
}

// Admin: create sub-category
export const createSubCategory = async (input: CreateSubCategoryInput) => {
  const parent = await prisma.category.findUnique({ where: { id: input.categoryId } })
  if (!parent) {
    throw { code: 'CATEGORY_NOT_FOUND', message: 'Parent category not found', status: 404 }
  }

  const exists = await prisma.subCategory.findFirst({
    where: { categoryId: input.categoryId, slug: input.slug },
  })
  if (exists) {
    throw { code: 'SLUG_EXISTS', message: 'Sub-category slug already in use', status: 409 }
  }

  return prisma.subCategory.create({ data: input })
}

// Admin: update sub-category
export const updateSubCategory = async (
  id:    string,
  input: Partial<CreateSubCategoryInput>
) => {
  return prisma.subCategory.update({ where: { id }, data: input })
}

// ═══════════════════════════════════════════
// SERVICE — Level 3
// ═══════════════════════════════════════════

// GET all services under a sub-category
export const getServices = async (subCategoryId: string) => {
  return prisma.service.findMany({
    where:   { subCategoryId, isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      subCategory: {
        select: {
          name:     true,
          nameNp:   true,
          category: { select: { name: true, nameNp: true, slug: true } },
        },
      },
    },
  })
}

// GET single service by slug
export const getServiceBySlug = async (
  categorySlug:    string,
  subCategorySlug: string,
  serviceSlug:     string
) => {
  const subCategory = await prisma.subCategory.findFirst({
    where: {
      slug:     subCategorySlug,
      category: { slug: categorySlug },
      isActive: true,
    },
    select: { id: true },
  })

  if (!subCategory) {
    throw { code: 'SUBCATEGORY_NOT_FOUND', message: 'Sub-category not found', status: 404 }
  }

  const service = await prisma.service.findFirst({
    where:   { subCategoryId: subCategory.id, slug: serviceSlug, isActive: true },
    include: {
      subCategory: {
        include: {
          category: { select: { name: true, nameNp: true, slug: true, icon: true } },
        },
      },
    },
  })

  if (!service) {
    throw { code: 'SERVICE_NOT_FOUND', message: 'Service not found', status: 404 }
  }

  // Attach market price data from real completed bookings
  const priceStats = await prisma.booking.aggregate({
    where: {
      category:  { slug: categorySlug },
      status:    'COMPLETED',
    },
    _min:  { priceNpr: true },
    _max:  { priceNpr: true },
    _avg:  { priceNpr: true },
    _count: { id: true },
  })

  return {
    service,
    marketData: {
      priceMin:      priceStats._min.priceNpr,
      priceMax:      priceStats._max.priceNpr,
      priceAvg:      Math.round(priceStats._avg.priceNpr ?? 0),
      totalBookings: priceStats._count.id,
    },
  }
}

// Admin: create service
export const createService = async (input: CreateServiceInput) => {
  const subCat = await prisma.subCategory.findUnique({
    where: { id: input.subCategoryId },
  })
  if (!subCat) {
    throw { code: 'SUBCATEGORY_NOT_FOUND', message: 'Sub-category not found', status: 404 }
  }

  const exists = await prisma.service.findFirst({
    where: { subCategoryId: input.subCategoryId, slug: input.slug },
  })
  if (exists) {
    throw { code: 'SLUG_EXISTS', message: 'Service slug already in use', status: 409 }
  }

  return prisma.service.create({
    data: {
      ...input,
      includedTasks: input.includedTasks ?? [],
      excludedTasks: input.excludedTasks ?? [],
    },
  })
}

// Admin: update service
export const updateService = async (
  id:    string,
  input: Partial<CreateServiceInput>
) => {
  return prisma.service.update({ where: { id }, data: input })
}

// Admin: toggle active
export const toggleService = async (id: string, isActive: boolean) => {
  return prisma.service.update({ where: { id }, data: { isActive } })
}

// ═══════════════════════════════════════════
// SEARCH — across all three levels
// ═══════════════════════════════════════════

export const searchServices = async (q: string) => {
  if (!q?.trim()) return []

  const [categories, subCategories, services] = await Promise.all([
    prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name:   { contains: q } },
          { nameNp: { contains: q } },
        ],
      },
      take: 3,
      select: { id: true, name: true, nameNp: true, slug: true, icon: true },
    }),

    prisma.subCategory.findMany({
      where: {
        isActive: true,
        OR: [
          { name:   { contains: q } },
          { nameNp: { contains: q } },
        ],
      },
      take: 5,
      include: {
        category: { select: { name: true, slug: true } },
      },
    }),

    prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name:        { contains: q } },
          { nameNp:      { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 10,
      include: {
        subCategory: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
    }),
  ])

  return { categories, subCategories, services }
}