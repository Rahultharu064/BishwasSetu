import { Request, Response, NextFunction } from 'express'
import * as ServiceModule from '../services/serviceService'
import { sendSuccess, sendError } from '../utils/response'
import { asString, requireString } from '../utils/reqValue'

// ── Level 1: Categories ───────────────────────────────────────

export const getAllCategories = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getAllCategories()
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getCategoryBySlug = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getCategoryBySlug(requireString(req.params.slug, "slug"))
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getProvidersByCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getProvidersByCategory(requireString(req.params.slug, "slug"), {
      serviceArea: asString(req.query.serviceArea),
      trustMin:    Number(req.query.trustMin ?? 0),
      page:        Number(req.query.page    ?? 1),
      limit:       Number(req.query.limit   ?? 10),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const createCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.createCategory(req.body)
    sendSuccess(res, data, 'Category created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.updateCategory(requireString(req.params.id, "id"), req.body)
    sendSuccess(res, data, 'Category updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const toggleCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.toggleCategory(
      requireString(req.params.id, "id"),
      req.body.isActive
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Level 2: Sub-categories ───────────────────────────────────

export const getSubCategories = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getSubCategories(requireString(req.params.slug, "slug"))
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getSubCategoryBySlug = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getSubCategoryBySlug(
      requireString(req.params.categorySlug, "categorySlug"),
      requireString(req.params.subSlug, "subSlug")
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const createSubCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.createSubCategory(req.body)
    sendSuccess(res, data, 'Sub-category created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateSubCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.updateSubCategory(requireString(req.params.id, "id"), req.body)
    sendSuccess(res, data, 'Sub-category updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Level 3: Services ─────────────────────────────────────────

export const getServices = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getServices(requireString(req.params.subCategoryId, "subCategoryId"))
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getServiceBySlug = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getServiceBySlug(
      requireString(req.params.categorySlug, "categorySlug"),
      requireString(req.params.subSlug, "subSlug"),
      requireString(req.params.serviceSlug, "serviceSlug")
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const createService = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.createService(req.body)
    sendSuccess(res, data, 'Service created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateService = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.updateService(requireString(req.params.id, "id"), req.body)
    sendSuccess(res, data, 'Service updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const toggleService = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.toggleService(
      requireString(req.params.id, "id"),
      req.body.isActive
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Search ────────────────────────────────────────────────────

export const searchServices = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.searchServices(asString(req.query.q) ?? '')
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}